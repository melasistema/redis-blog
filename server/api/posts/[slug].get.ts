/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineEventHandler, getRouterParam } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  const post = await PostRepository.getBySlug(slug);

  if (!post) {
    event.node.res.statusCode = 404;
    return { success: false, error: 'Post not found' };
  }

  return { success: true, post };
});
