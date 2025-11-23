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

    const results = await redis
      .multi(keys.map(k => ['JSON.GET', k]))
      .exec();

    return results.map(r => r[1]).filter(Boolean);
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