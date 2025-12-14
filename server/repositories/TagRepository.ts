/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/repositories/TagRepository.ts

import { getRedis } from '~/server/utils/redis';

export const TagRepository = {
  async all() {
    const redis = await getRedis();
    return redis.sMembers('tags:all');
  }
};