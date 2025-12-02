/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { getRedis } from '~/server/utils/redis';

export const PostRepository = {
  async getLatest(limit = 20) {
    const redis = await getRedis();
    const keys = await redis.zRange('posts:by_date', 0, limit - 1, { REV: true });

    if (keys.length === 0) return [];

    const multi = redis.multi();
    for (const key of keys) {
      multi.json.get(key);
    }
    const results = await multi.exec();

    return results.filter(Boolean);
  },

  async getPaginated(offset: number, limit: number) {
    const redis = await getRedis();
    const keys = await redis.zRange('posts:by_date', offset, offset + limit - 1, { REV: true });

    if (keys.length === 0) return [];

    const multi = redis.multi();
    for (const key of keys) {
      multi.json.get(key);
    }
    const results = await multi.exec();

    return results.filter(Boolean);
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

  async getTagsForPost(postId: string) {
    const redis = await getRedis();
    return redis.sMembers(`post:${postId}:tags`);
  }
};
