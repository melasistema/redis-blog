/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/api/posts/[slug].get.ts

import { defineEventHandler, getRouterParam } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';
import { defaultBlogConfig } from '~/config/blog.config';
import { getRedis } from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug');
    const postRepository = new PostRepository(getRedis);

    if (!slug) {
        event.node.res.statusCode = 400;
        return { success: false, error: 'Slug parameter is required' };
    }

    const post = await postRepository.getBySlug(slug);

    if (!post) {
        event.node.res.statusCode = 404;
        return { success: false, error: 'Post not found' };
    }

    let neighbors = null;
    if (defaultBlogConfig.postNavigation.enabled) {
        neighbors = await postRepository.getNeighbors(slug);
    }

    return { success: true, post, neighbors };
});