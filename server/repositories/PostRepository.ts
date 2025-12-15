/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/repositories/PostRepository.ts

import type { RedisClientType } from 'redis';
import { slugify } from '~/server/utils/slugify';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

// --- Types ---
export interface Post {
    id: string;
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    images?: string[];
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

    private normalizeTags(tags: string[] = []): string[] {
        if (!tags || !Array.isArray(tags)) {
            return [];
        }
        // Use a Set to handle duplicates that might arise from lowercasing
        const normalizedSet = new Set(
            tags.map(tag => tag.trim().toLowerCase()).filter(Boolean)
        );
        return Array.from(normalizedSet);
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

    async getById(id: string): Promise<Post | null> {
        const redis = await this.redis();
        const key = `post:${id}`;
        // Verify key exists before fetching
        if (!(await redis.exists(key))) {
            return null;
        }
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

    async createPost(data: Pick<Post, 'title' | 'content' | 'excerpt' | 'featured_image' | 'author' | 'tags' | 'createdAt'>): Promise<Post> {
        const redis = await this.redis();
        const slug = slugify(data.title);
        const id = uuidv4();
        const key = `post:${id}`;

        const normalizedTags = this.normalizeTags(data.tags);

        const post: Post = {
            id,
            slug,
            ...data,
            images: [],
            tags: normalizedTags,
            excerpt: data.excerpt || data.content.substring(0, 150)
        };

        const multi = redis.multi();
        multi.json.set(key, '$', post as any);
        multi.zAdd('posts:by_date', { score: data.createdAt, value: key });
        multi.hSet('slugs', slug, key);

        if (normalizedTags.length) {
            for (const tag of normalizedTags) {
                multi.sAdd('tags:all', tag);
                multi.sAdd(`tag:${slugify(tag)}`, key);
            }
        }

        await multi.exec();
        return post;
    }

    async updatePost(id: string, updated: Partial<Omit<Post, 'id' | 'createdAt'>>): Promise<Post> {
        const redis = await this.redis();
        const key = `post:${id}`;

        const existing = await redis.json.get(key) as Post | null;
        if (!existing) {
            throw new Error(`Post with id "${id}" not found`);
        }

        const newSlug = updated.title ? slugify(updated.title) : existing.slug;
        const normalizedTags = updated.tags ? this.normalizeTags(updated.tags) : existing.tags;

        const post: Post = {
            ...existing,
            ...updated,
            tags: normalizedTags,
            slug: newSlug,
            excerpt: updated.excerpt || existing.excerpt || (updated.content || existing.content).substring(0, 150)
        };
        const multi = redis.multi();
        multi.json.set(key, '$', post as any);

        if (existing.slug !== newSlug) {
            multi.hDel('slugs', existing.slug);
            multi.hSet('slugs', newSlug, key);
        }

        const oldTags = new Set(this.normalizeTags(existing.tags));
        const newTags = new Set(post.tags || []);

        oldTags.forEach(t => {
            if (!newTags.has(t)) {
                multi.sRem(`tag:${slugify(t)}`, key);
            }
        });
        newTags.forEach(t => {
            if (!oldTags.has(t)) {
                multi.sAdd(`tag:${slugify(t)}`, key);
                multi.sAdd('tags:all', t);
            }
        });

        await multi.exec();
        return post;
    }

    async delete(slug: string): Promise<{ deleted: boolean; postId: string | null }> {
        const redis = await this.redis();
        const postKey = await redis.hGet('slugs', slug);

        if (!postKey) {
            return { deleted: false, postId: null };
        }

        const post = await redis.json.get(postKey) as Post | null;
        if (!post) {
            // This can happen if slugs hash is out of sync
            redis.hDel('slugs', slug); // Clean up inconsistent hash
            return { deleted: false, postId: null };
        }
        const tags = post.tags || [];

        const multi = redis.multi();
        multi.json.del(postKey, '$');
        multi.zRem('posts:by_date', postKey);
        multi.hDel('slugs', slug);

        const normalizedTags = this.normalizeTags(tags);
        normalizedTags.forEach(t => multi.sRem(`tag:${slugify(t)}`, postKey));

        await multi.exec();
        return { deleted: true, postId: post.id };
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
