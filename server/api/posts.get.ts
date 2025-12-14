/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// resource: server/api/posts.get.ts
import { defineEventHandler, getQuery } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';
import { defaultBlogConfig } from '~/config/blog.config';
import { getRedis } from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const postRepository = new PostRepository(getRedis);
  const query = getQuery(event);
  const searchQuery = query.q as string;

  // If a search query is provided, use the search repository method.
  if (searchQuery) {
    const { posts, total } = await postRepository.searchPosts(searchQuery);

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
  const { pagination: blogPagination } = defaultBlogConfig;

  if (blogPagination.enabled) {
    const page = parseInt(query.page as string || '1', 10);
    const limit = parseInt(query.limit as string || String(blogPagination.postsPerPage), 10);
    const offset = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      postRepository.getPaginated(offset, limit),
      postRepository.getTotalCount(),
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

  const posts = await postRepository.getLatest(1000);

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
