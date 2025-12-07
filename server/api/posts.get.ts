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

  const query = getQuery(event);
  const searchQuery = query.q as string;

  // If a search query is provided, use the search repository method.
  if (searchQuery) {
    const { posts, total } = await PostRepository.searchPosts(searchQuery);

    return {
      success: true,
      posts,
      meta: {
        total,
        page: 1, // Search results are not paginated for this implementation
        limit: total,
        totalPages: 1,
      },
    };
  }

  // Otherwise, fall back to the standard paginated post list.
  const { pagination } = defaultBlogConfig;

  if (pagination.enabled) {
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
  }

  // Fallback for when pagination is disabled.

  const posts = await PostRepository.getLatest(1000);

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

});
