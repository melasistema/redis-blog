/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineEventHandler } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';

export default defineEventHandler(async () => {
  const posts = await PostRepository.getLatest(20);
  return { success: true, posts };
});
