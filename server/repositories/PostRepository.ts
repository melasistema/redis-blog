// server/PostRepository.ts

import type { RedisClientType } from 'redis';
import { slugify } from '~/server/utils/slugify';
import chalk from 'chalk';

// --- Types ---
export interface Post {
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    image?: string;
    createdAt: number;
    author?: string;
    tags?: string[];
}

export type NeighborPost = { slug: string; title: string } | null;

// --- RediSearch ---
const POST_SEARCH_INDEX = 'idx:posts';
const schema = {
    '$.title': { type: 'TEXT' as const, AS: 'title', WEIGHT: 10 },
    '$.content': { type: 'TEXT' as const, AS: 'content' },
    '$.tags': { type: 'TAG' as const, AS: 'tags' },
    '$.author': { type: 'TEXT' as const, AS: 'author' },
};
const options = { ON: 'JSON' as const, PREFIX: 'post:', STOPWORDS: [] as string[] };

// --- Core Repository ---
export class PostRepository {
    constructor(private getRedisClient: () => Promise<RedisClientType>) {}

    private async redis() {
        return this.getRedisClient();
    }

    async getLatest(limit = 20): Promise<Post[]> {
        const redis = await this.redis();
        const keys = await redis.zRange('posts:by_date', 0, limit - 1, { REV: true });
        if (!keys.length) return [];
        const results = await redis.json.mGet(keys, '$') as (Post[] | null)[];
        return results.map(r => r?.[0]).filter(Boolean) as Post[];
    }

    async getPaginated(offset: number, limit: number): Promise<Post[]> {
        const redis = await this.redis();
        const keys = await redis.zRange('posts:by_date', offset, offset + limit - 1, { REV: true });
        if (!keys.length) return [];
        const results = await redis.json.mGet(keys, '$') as (Post[] | null)[];
        return results.map(r => r?.[0]).filter(Boolean) as Post[];
    }

    async getTotalCount(): Promise<number> {
        const redis = await this.redis();
        return redis.zCard('posts:by_date');
    }

    async getBySlug(slug: string): Promise<Post | null> {
        const redis = await this.redis();
        const key = await redis.hGet('slugs', slug);
        if (!key) return null;
        return redis.json.get(key) as Promise<Post | null>;
    }

    async getNeighbors(slug: string): Promise<{ prev: NeighborPost; next: NeighborPost }> {
        const redis = await this.redis();
        const key = await redis.hGet('slugs', slug);
        if (!key) return { prev: null, next: null };

        const rank = await redis.zRevRank('posts:by_date', key);
        if (rank === null) return { prev: null, next: null };

        const [prevKey] = await redis.zRange('posts:by_date', rank + 1, rank + 1, { REV: true });
        const [nextKey] = await redis.zRange('posts:by_date', rank - 1, rank - 1, { REV: true });

        const fetchNeighbor = async (k?: string): Promise<NeighborPost> => {
            if (!k) return null;
            const post = await redis.json.get(k) as Post | null;
            return post ? { slug: post.slug, title: post.title } : null;
        };

        const [prev, next] = await Promise.all([fetchNeighbor(prevKey), fetchNeighbor(nextKey)]);
        return { prev, next };
    }

    async getAllSlugs(): Promise<Array<{ slug: string; createdAt: number }>> {
        const redis = await this.redis();
        const keys = await redis.zRange('posts:by_date', 0, -1);
        if (!keys.length) return [];

        const results = await Promise.all(
            keys.map(async key => {
                const slug = await redis.json.get(key, { path: ['$.slug'] }) as string | null;
                const createdAtRaw = await redis.json.get(key, { path: ['$.createdAt'] });
                const createdAt = typeof createdAtRaw === 'number' ? createdAtRaw : Number(createdAtRaw);
                if (slug && !isNaN(createdAt)) return { slug, createdAt };
                return null;
            })
        );
        return results.filter(Boolean) as Array<{ slug: string; createdAt: number }>;
    }

    async createPost(data: Pick<Post, 'title' | 'content' | 'excerpt' | 'image' | 'author' | 'tags' | 'createdAt'>): Promise<Post> {
        const redis = await this.redis();
        const slug = slugify(data.title);
        const key = `post:${slug}`;
        const post: Post = { slug, ...data, excerpt: data.excerpt || data.content.substring(0, 150) };

        const multi = redis.multi();
        multi.json.set(key, '$', post as any);
        multi.zAdd('posts:by_date', { score: data.createdAt, value: key });
        multi.hSet('slugs', slug, key);

        if (data.tags?.length) {
            for (const tag of data.tags) {
                const clean = tag.trim();
                if (clean) {
                    multi.sAdd('tags:all', clean);
                    multi.sAdd(`tag:${slugify(clean)}`, key);
                }
            }
        }

        await multi.exec();
        return post;
    }

    async updatePost(slug: string, updated: Post): Promise<Post> {
        const redis = await this.redis();
        const oldKey = `post:${slug}`;
        const newSlug = slugify(updated.title);
        const newKey = `post:${newSlug}`;

        const existing = await redis.json.get(oldKey, { path: ['$'] }) as Post | null; // Corrected: directly get Post | null
        if (!existing) {
            throw new Error(`Post ${slug} not found`);
        }

        const post: Post = { ...updated, slug: newSlug, excerpt: updated.excerpt || updated.content.substring(0, 150) };
        const multi = redis.multi();

        if (slug !== newSlug) {
            multi.json.set(newKey, '$', post as any);
            multi.zRem('posts:by_date', oldKey);
            multi.zAdd('posts:by_date', { score: post.createdAt, value: newKey });
            multi.hDel('slugs', slug);
            multi.hSet('slugs', newSlug, newKey);

            (existing.tags || []).forEach(t => multi.sRem(`tag:${slugify(t)}`, oldKey));
            (post.tags || []).forEach(t => multi.sAdd(`tag:${slugify(t)}`, newKey));
            multi.json.del(oldKey, '$');
        } else {
            multi.json.set(oldKey, '$', post as any);
            const oldTags = new Set(existing.tags || []);
            const newTags = new Set(post.tags || []);
            oldTags.forEach(t => { if (!newTags.has(t)) multi.sRem(`tag:${slugify(t)}`, oldKey); });
            newTags.forEach(t => { if (!oldTags.has(t)) multi.sAdd(`tag:${slugify(t)}`, oldKey); });
        }

        await multi.exec();
        return post;
    }

    async deletePost(post: { key: string; slug: string; tags?: string[] }) {
        const redis = await this.redis();
        const multi = redis.multi();
        multi.json.del(post.key, '$');
        multi.zRem('posts:by_date', post.key);
        multi.hDel('slugs', post.slug);
        (post.tags || []).forEach(t => multi.sRem(`tag:${slugify(t)}`, post.key));
        await multi.exec();
    }

    async ensureSearchIndex() {
        const redis = await this.redis();
        try {
            await redis.ft.info(POST_SEARCH_INDEX);
        } catch (err) {
            if (String(err).includes('Unknown index name')) {
                await redis.ft.create(POST_SEARCH_INDEX, schema as any, options as any);
            } else throw err;
        }
    }

    async searchPosts(query: string): Promise<{ total: number; posts: Post[] }> {
        await this.ensureSearchIndex();
        const redis = await this.redis();
        const results = await redis.ft.search(POST_SEARCH_INDEX, query);
        return { total: results.total, posts: results.documents.map(doc => doc.value as unknown as Post) };
    }
}
