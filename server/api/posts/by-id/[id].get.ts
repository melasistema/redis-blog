/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/api/posts/by-id/[id].get.ts

import { defineEventHandler, getRouterParam } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';
import { getRedis } from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
    // This is an admin-only endpoint, ensure user is authenticated
    if (!event.context.user || !event.context.user.roles?.includes('admin')) {
        event.node.res.statusCode = 403;
        return { success: false, message: 'Forbidden.' };
    }

    const id = getRouterParam(event, 'id');
    if (!id) {
        event.node.res.statusCode = 400;
        return { success: false, error: 'Post ID parameter is required' };
    }
    
    const postRepository = new PostRepository(getRedis);
    const post = await postRepository.getById(id);

    if (!post) {
        event.node.res.statusCode = 404;
        return { success: false, error: 'Post not found' };
    }

    // Unlike the public-facing slug endpoint, we don't need neighbors here.
    return { success: true, post };
});
