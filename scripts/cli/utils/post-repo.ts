/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// scripts/cli/utils/post-repo.ts
import { getRedisClient } from './redis-client';
import { PostRepository } from '~/server/repositories/PostRepository';

export const PostRepoCLI = new PostRepository(getRedisClient);
