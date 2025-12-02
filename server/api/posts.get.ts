/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineEventHandler, getQuery } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';
import { defaultBlogConfig } from '~/config/blog.config';

export default defineEventHandler(async (event) => {
  const { pagination } = defaultBlogConfig;

  if (pagination.enabled) {
    const query = getQuery(event);
    const page = parseInt(query.page as string || '1', 10);
    const limit = pagination.postsPerPage;
    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      PostRepository.getPaginated(offset, limit),
      PostRepository.getTotalCount(),
    ]);

    return {
      success: true,
      posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } else {
    const posts = await PostRepository.getLatest(1000); // Fetch a large number to simulate "all"
    return {
      success: true,
      posts,
      meta: {
        total: posts.length,
        page: 1,
        limit: posts.length,
        totalPages: 1,
      }
    };
  }
});