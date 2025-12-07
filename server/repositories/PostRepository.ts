/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { getRedis } from '~/server/utils/redis';

// Define the name of the RediSearch index for posts.
const POST_SEARCH_INDEX = 'idx:posts';

export const PostRepository = {
  // getLatest retrieves the most recent posts.
  // It now uses JSON.MGET for efficient bulk fetching instead of a loop.
  async getLatest(limit = 20) {
    const redis = await getRedis();
    const keys = await redis.zRange('posts:by_date', 0, limit - 1, { REV: true });
    if (keys.length === 0) return [];
    
    // Using JSON.MGET is significantly more performant than looping through keys.
    const results = await redis.json.mGet(keys, '$');
    // Explicitly map and unwrap the nested array structure from mGet.
    return results.map(result => result?.[0]).filter(Boolean);
  },

  // getPaginated retrieves a specific page of posts.
  // This has also been updated to use the more efficient JSON.MGET.
  async getPaginated(offset: number, limit: number) {
    const redis = await getRedis();
    const keys = await redis.zRange('posts:by_date', offset, offset + limit - 1, { REV: true });
    if (keys.length === 0) return [];
    
    const results = await redis.json.mGet(keys, '$');
    // Explicitly map and unwrap the nested array structure from mGet.
    return results.map(result => result?.[0]).filter(Boolean);
  },

  async getTotalCount() {
    const redis = await getRedis();
    return redis.zCard('posts:by_date');
  },

  async getBySlug(slug: string) {
    const redis = await getRedis();
    const key = await redis.hGet('slugs', slug);
    if (!key) return null;
    return redis.json.get(key);
  },

  async getNeighbors(slug: string) {
    const redis = await getRedis();
    const postKey = await redis.hGet('slugs', slug);
    if (!postKey) return { prev: null, next: null };

    const rank = await redis.zRevRank('posts:by_date', postKey);
    if (rank === null) return { prev: null, next: null };

    const [prevKey] = await redis.zRange('posts:by_date', rank + 1, rank + 1, { REV: true });
    const [nextKey] = await redis.zRange('posts:by_date', rank - 1, rank - 1, { REV: true });

    const fetchNeighbor = async (key) => {
      if (!key) return null;
      const post = await redis.json.get(key);
      return post ? { slug: post.slug, title: post.title } : null;
    };

    const [prev, next] = await Promise.all([fetchNeighbor(prevKey), fetchNeighbor(nextKey)]);
    return { prev, next };
  },

  // --- RediSearch Integration ---

  // ensureSearchIndex creates the RediSearch index if it doesn't already exist.
  // This makes the search functionality self-initializing.
  async ensureSearchIndex() {
    const redis = await getRedis();
    try {
      await redis.ft.info(POST_SEARCH_INDEX);
    } catch (e) {
      if (String(e).includes('Unknown index name')) {
        await redis.ft.create(
          POST_SEARCH_INDEX,
          {
            '$.title': { type: 'TEXT', AS: 'title', WEIGHT: 10.0 },
            '$.content': { type: 'TEXT', AS: 'content' },
            '$.tags': { type: 'TAG', AS: 'tags' },
            '$.author': { type: 'TEXT', AS: 'author' },
          },
          {
            ON: 'JSON',
            PREFIX: 'post:',
          }
        );
      } else {
        throw e;
      }
    }
  },

  // searchPosts performs a full-text search across the post index.
  async searchPosts(query: string) {
    await this.ensureSearchIndex();
    const redis = await getRedis();

    // The search result includes the total number of matching documents
    // and the documents themselves, which contain the post objects.
    const searchResults = await redis.ft.search(POST_SEARCH_INDEX, query);
    
    return {
      total: searchResults.total,
      // The `document` object from ft.search contains the full JSON object
      // in its `value` property.
      posts: searchResults.documents.map(doc => doc.value),
    };
  },
};