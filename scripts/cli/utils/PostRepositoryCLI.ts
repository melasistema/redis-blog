/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// Use CLI's redis client
import { getRedisClient } from './redis-client';
import type { RedisClientType } from 'redis';
import { slugify } from './slugify'; // Import slugify
import chalk from 'chalk'; // Import chalk

// --- RediSearch index name ---
const POST_SEARCH_INDEX = 'idx:posts';

// --- Types ---
// Define types directly to avoid external dependencies
export interface Post {
    slug: string;
    title: string;
    content: string;
    excerpt?: string; // Optional excerpt for SEO and previews
    image?: string;   // Optional image URL for Open Graph and display
    createdAt: number; // Timestamp of post creation
    author?: string;
    tags?: string[];
}

export type NeighborPost = { slug: string; title: string } | null;

// --- RediSearch schema ---
const schema = {
    '$.title': { type: 'TEXT' as const, AS: 'title', WEIGHT: 10 },
    '$.content': { type: 'TEXT' as const, AS: 'content' },
    '$.tags': { type: 'TAG' as const, AS: 'tags' },
    '$.author': { type: 'TEXT' as const, AS: 'author' },
};

// --- RediSearch create options ---
const options = {
    ON: 'JSON' as const,
    PREFIX: 'post:',
    STOPWORDS: [] as string[],
};

// --- Repository ---
export const PostRepositoryCLI = {
    async getLatest(limit = 20): Promise<Post[]> {
        const redis = getRedisClient();
        const keys = await redis.zRange('posts:by_date', 0, limit - 1, { REV: true });
        if (!keys.length) return [];
        const results = await redis.json.mGet(keys, '$') as (Post[] | null)[];
        return results.map(r => r?.[0]).filter(Boolean) as Post[];
    },

    async getPaginated(offset: number, limit: number): Promise<Post[]> {
        const redis = getRedisClient();
        const keys = await redis.zRange('posts:by_date', offset, offset + limit - 1, { REV: true });
        if (!keys.length) return [];
        const results = await redis.json.mGet(keys, '$') as (Post[] | null)[];
        return results.map(r => r?.[0]).filter(Boolean) as Post[];
    },

    async getTotalCount(): Promise<number> {
        const redis = getRedisClient();
        return redis.zCard('posts:by_date');
    },

    async getBySlug(slug: string): Promise<Post | null> {
        const redis = getRedisClient();
        const key = await redis.hGet('slugs', slug);
        if (!key) {
            console.error(chalk.red(`No key found for slug: ${slug}`));
            return null;
        }
        try {
            const result = await redis.json.get(key, { path: '$' }) as Post[] | null;
            return result?.[0] || null;
        } catch (err) {
            console.error(chalk.red(`Error fetching post with key ${key}:`, err));
            return null;
        }
    },

    async getNeighbors(slug: string): Promise<{ prev: NeighborPost; next: NeighborPost }> {
        const redis = getRedisClient();
        const key = await redis.hGet('slugs', slug);
        if (!key) return { prev: null, next: null };

        const rank = await redis.zRevRank('posts:by_date', key);
        if (rank === null) return { prev: null, next: null };

        const [prevKey] = await redis.zRange('posts:by_date', rank + 1, rank + 1, { REV: true });
        const [nextKey] = await redis.zRange('posts:by_date', rank - 1, rank - 1, { REV: true });

        const fetchNeighbor = async (k: string | undefined): Promise<NeighborPost> => {
            if (!k) return null;
            try {
                const result = await redis.json.get(k, { path: '$' }) as Post[] | null;
                const post = result?.[0];
                return post ? { slug: post.slug, title: post.title } : null;
            } catch (err) {
                console.error(chalk.red(`Error fetching neighbor ${k}:`, err));
                return null;
            }
        };

        const [prev, next] = await Promise.all([fetchNeighbor(prevKey), fetchNeighbor(nextKey)]);
        return { prev, next };
    },

    async getAllSlugs(): Promise<Array<{ slug: string; createdAt: number }>> {
        const redis = getRedisClient();
        const keys = await redis.zRange('posts:by_date', 0, -1);
        if (!keys.length) return [];

        const results = await Promise.all(
            keys.map(async (key) => {
                try {
                    const result = await redis.json.get(key, { path: '$' }) as Post[] | null;
                    const post = result?.[0];
                    if (post && post.slug && post.createdAt) {
                        return { slug: post.slug, createdAt: post.createdAt };
                    }
                } catch (err) {
                    console.error(chalk.red(`Error fetching post ${key}:`, err));
                }
                return null;
            })
        );
        return results.filter(Boolean) as Array<{ slug: string; createdAt: number }>;
    },

    async createPost(postData: Pick<Post, 'title' | 'content' | 'excerpt' | 'image' | 'author' | 'tags' | 'createdAt'>): Promise<Post> {
        const { title, content, excerpt, image, author, tags, createdAt } = postData;

        const slug = slugify(title);
        const postKey = `post:${slug}`;

        const post: Post = {
            slug,
            title,
            content,
            excerpt: excerpt || content?.substring(0, 150),
            image,
            author,
            tags,
            createdAt,
        };

        const redis = getRedisClient();
        const multi = redis.multi();
        multi.json.set(postKey, '$', post as any);
        multi.zAdd('posts:by_date', { score: createdAt, value: postKey });
        multi.hSet('slugs', slug, postKey);

        if (tags?.length) {
            for (const tag of tags) {
                const cleanTag = tag.trim();
                if (cleanTag) {
                    multi.sAdd('tags:all', cleanTag);
                    multi.sAdd(`tag:${slugify(cleanTag)}`, postKey);
                }
            }
        }

        await multi.exec();
        console.log(chalk.gray(`Redis transaction executed for new post: "${post.title}"`));

        return post;
    },

    async updatePost(slug: string, updatedPost: Post): Promise<Post> {
        const redis = getRedisClient();
        const oldKey = `post:${slug}`;
        const newSlug = slugify(updatedPost.title);
        const newKey = `post:${newSlug}`;

        const result = await redis.json.get(oldKey, { path: '$' }) as Post[] | null;
        const existingPost = result?.[0] || null;
        if (!existingPost) {
            throw new Error(`Post with slug "${slug}" not found`);
        }

        const post: Post = {
            slug: newSlug,
            title: updatedPost.title,
            content: updatedPost.content,
            excerpt: updatedPost.excerpt || updatedPost.content?.substring(0, 150),
            image: updatedPost.image,
            author: updatedPost.author,
            tags: updatedPost.tags,
            createdAt: updatedPost.createdAt,
        };

        const multi = redis.multi();

        if (slug !== newSlug) {
            multi.json.set(newKey, '$', post as any);
            multi.zRem('posts:by_date', oldKey);
            multi.zAdd('posts:by_date', { score: post.createdAt, value: newKey });
            multi.hDel('slugs', slug);
            multi.hSet('slugs', newSlug, newKey);

            if (existingPost.tags?.length) {
                for (const tag of existingPost.tags) {
                    multi.sRem(`tag:${slugify(tag)}`, oldKey);
                }
            }

            if (post.tags?.length) {
                for (const tag of post.tags) {
                    const cleanTag = tag.trim();
                    if (cleanTag) {
                        multi.sAdd('tags:all', cleanTag);
                        multi.sAdd(`tag:${slugify(cleanTag)}`, newKey);
                    }
                }
            }

            multi.json.del(oldKey, '$');
        } else {
            multi.json.set(oldKey, '$', post as any);

            const oldTags = new Set(existingPost.tags || []);
            const newTags = new Set(post.tags || []);

            for (const tag of oldTags) {
                if (!newTags.has(tag)) {
                    multi.sRem(`tag:${slugify(tag)}`, oldKey);
                }
            }

            for (const tag of newTags) {
                if (!oldTags.has(tag)) {
                    const cleanTag = tag.trim();
                    if (cleanTag) {
                        multi.sAdd('tags:all', cleanTag);
                        multi.sAdd(`tag:${slugify(cleanTag)}`, oldKey);
                    }
                }
            }
        }

        await multi.exec();
        console.log(chalk.gray(`Redis transaction executed for updating post: "${post.title}"`));

        return post;
    },

    async deletePost(post: { key: string; slug: string; title: string; tags?: string[] }) {
        const redis = getRedisClient();
        const multi = redis.multi();

        multi.json.del(post.key, '$');
        multi.zRem('posts:by_date', post.key);
        multi.hDel('slugs', post.slug);

        if (post.tags?.length) {
            for (const tag of post.tags) {
                multi.sRem(`tag:${slugify(tag)}`, post.key);
            }
        }

        console.log(chalk.gray(`Preparing Redis transaction to delete post: "${post.title}" (Key: ${post.key})`));

        await multi.exec();
    },

    async ensureSearchIndex(): Promise<void> {
        const redis = getRedisClient();
        try {
            await redis.ft.info(POST_SEARCH_INDEX);
        } catch (err) {
            if (String(err).includes('Unknown index name')) {
                // @ts-ignore - Redis type definitions are strict, but this works at runtime
                await redis.ft.create(POST_SEARCH_INDEX, schema, options);
            } else {
                throw err;
            }
        }
    },

    async searchPosts(query: string): Promise<{ total: number; posts: Post[] }> {
        await this.ensureSearchIndex();
        const redis = getRedisClient();
        const searchResults = await redis.ft.search(POST_SEARCH_INDEX, query);
        return {
            total: searchResults.total,
            posts: searchResults.documents.map(doc => doc.value as unknown as Post),
        };
    },
};