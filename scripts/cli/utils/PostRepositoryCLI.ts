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
};

export type NeighborPost = { slug: string; title: string } | null;

// --- RediSearch schema ---
const schema = {
    '$.title': { type: 'TEXT', AS: 'title', WEIGHT: 10 },
    '$.content': { type: 'TEXT', AS: 'content' },
    '$.tags': { type: 'TAG', AS: 'tags' },
    '$.author': { type: 'TEXT', AS: 'author' },
};

// --- RediSearch create options ---
const options = {
    ON: 'JSON',
    PREFIX: 'post:',
    STOPWORDS: [],
};

// --- Repository ---
export const PostRepositoryCLI = { // Renamed to PostRepositoryCLI
    async getLatest(limit = 20): Promise<Post[]> {
        const redis = getRedisClient(); // Use CLI redis client
        const keys = await redis.zRange('posts:by_date', 0, limit - 1, { REV: true });
        if (!keys.length) return [];
        const results = await redis.json.mGet(keys, '$') as (Post[] | null)[];
        return results.map(r => r?.[0]).filter(Boolean) as Post[];
    },

    async getPaginated(offset: number, limit: number): Promise<Post[]> {
        const redis = getRedisClient(); // Use CLI redis client
        const keys = await redis.zRange('posts:by_date', offset, offset + limit - 1, { REV: true });
        if (!keys.length) return [];
        const results = await redis.json.mGet(keys, '$') as (Post[] | null)[];
        return results.map(r => r?.[0]).filter(Boolean) as Post[];
    },

    async getTotalCount(): Promise<number> {
        const redis = getRedisClient(); // Use CLI redis client
        return redis.zCard('posts:by_date');
    },

    async getBySlug(slug: string): Promise<Post | null> {
        const redis = getRedisClient(); // Use CLI redis client
        const key = await redis.hGet('slugs', slug);
        if (!key) return null;
        return redis.json.get(key) as Promise<Post | null>;
    },

    async getNeighbors(slug: string): Promise<{ prev: NeighborPost; next: NeighborPost }> {
        const redis = getRedisClient(); // Use CLI redis client
        const key = await redis.hGet('slugs', slug);
        if (!key) return { prev: null, next: null };

        const rank = await redis.zRevRank('posts:by_date', key);
        if (rank === null) return { prev: null, next: null };

        const [prevKey] = await redis.zRange('posts:by_date', rank + 1, rank + 1, { REV: true });
        const [nextKey] = await redis.zRange('posts:by_date', rank - 1, rank - 1, { REV: true });

        const fetchNeighbor = async (k: string | undefined): Promise<NeighborPost> => {
            if (!k) return null;
            const post = await redis.json.get(k) as Post | null;
            return post ? { slug: post.slug, title: post.title } : null;
        };

        const [prev, next] = await Promise.all([fetchNeighbor(prevKey), fetchNeighbor(nextKey)]);
        return { prev, next };
    },

    async getAllSlugs(): Promise<Array<{ slug: string; createdAt: number }>> {
        const redis = getRedisClient(); // Use CLI redis client
        const keys = await redis.zRange('posts:by_date', 0, -1); // Get all post keys
        if (!keys.length) return [];

        // Fetch slug and createdAt for each post key
        const results = await Promise.all(
            keys.map(async (key) => {
                const post = await redis.json.get(key, '$.slug', '$.createdAt') as [string | null, number | null]; // Get slug and createdAt
                if (post && post[0] && post[1]) {
                    return { slug: post[0], createdAt: post[1] };
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
        
        // await redis.save(); // save is handled by top-level CLI command
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
        // await redis.save(); // save is handled by top-level CLI command
    },

    async ensureSearchIndex(): Promise<void> {
        const redis = getRedisClient(); // Use CLI redis client
        try {
            await redis.ft.info(POST_SEARCH_INDEX);
        } catch (err) {
            if (String(err).includes('Unknown index name')) {
                // keep IDE complaint; runtime works fine
                await redis.ft.create(POST_SEARCH_INDEX, schema, options);
            } else {
                throw err;
            }
        }
    },

    async searchPosts(query: string): Promise<{ total: number; posts: Post[] }> {
        await this.ensureSearchIndex();
        const redis = getRedisClient(); // Use CLI redis client
        const searchResults = await redis.ft.search(POST_SEARCH_INDEX, query);
        return {
            total: searchResults.total,
            posts: searchResults.documents.map(doc => doc.value as Post),
        };
    },
};
