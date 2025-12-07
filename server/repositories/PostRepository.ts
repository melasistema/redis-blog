/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { getRedis } from '~/server/utils/redis';

// --- RediSearch index name ---
const POST_SEARCH_INDEX = 'idx:posts';

// --- Types ---
export type Post = {
    slug: string;
    title: string;
    content: string;
    author?: string;
    tags?: string[];
    [key: string]: any;
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
export const PostRepository = {
    async getLatest(limit = 20): Promise<Post[]> {
        const redis = await getRedis();
        const keys = await redis.zRange('posts:by_date', 0, limit - 1, { REV: true });
        if (!keys.length) return [];
        const results = await redis.json.mGet(keys, '$') as (Post[] | null)[];
        return results.map(r => r?.[0]).filter(Boolean) as Post[];
    },

    async getPaginated(offset: number, limit: number): Promise<Post[]> {
        const redis = await getRedis();
        const keys = await redis.zRange('posts:by_date', offset, offset + limit - 1, { REV: true });
        if (!keys.length) return [];
        const results = await redis.json.mGet(keys, '$') as (Post[] | null)[];
        return results.map(r => r?.[0]).filter(Boolean) as Post[];
    },

    async getTotalCount(): Promise<number> {
        const redis = await getRedis();
        return redis.zCard('posts:by_date');
    },

    async getBySlug(slug: string): Promise<Post | null> {
        const redis = await getRedis();
        const key = await redis.hGet('slugs', slug);
        if (!key) return null;
        return redis.json.get(key) as Promise<Post | null>;
    },

    async getNeighbors(slug: string): Promise<{ prev: NeighborPost; next: NeighborPost }> {
        const redis = await getRedis();
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

    async ensureSearchIndex(): Promise<void> {
        const redis = await getRedis();
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
        const redis = await getRedis();
        const searchResults = await redis.ft.search(POST_SEARCH_INDEX, query);
        return {
            total: searchResults.total,
            posts: searchResults.documents.map(doc => doc.value as Post),
        };
    },
};
