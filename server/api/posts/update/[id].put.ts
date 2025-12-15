/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/api/posts/[id].put.ts

import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';
import { getRedis } from '~/server/utils/redis';
import type { Post } from '~/server/repositories/PostRepository';

export default defineEventHandler(async (event) => {
    // Ensure only authenticated users with 'admin' role can update posts
    if (!event.context.user || !event.context.user.roles?.includes('admin')) {
        event.node.res.statusCode = 403;
        return { success: false, message: 'Forbidden. Only administrators can update posts.' };
    }

    const id = getRouterParam(event, 'id');
    const updatedPostData: Partial<Omit<Post, 'id' | 'createdAt'>> = await readBody(event);
    const postRepository = new PostRepository(getRedis);

    if (!id) {
        event.node.res.statusCode = 400;
        return { success: false, message: 'Post ID parameter is required.' };
    }

    // Basic validation for updatedPostData
    if (!updatedPostData || !updatedPostData.title || !updatedPostData.content) {
        event.node.res.statusCode = 400;
        return { success: false, message: 'Invalid post data provided. Title and content are required.' };
    }

    try {
        const updatedPost = await postRepository.updatePost(id, updatedPostData);
        return { success: true, message: `Post "${updatedPost.title}" updated successfully.`, post: updatedPost };
    } catch (error: any) {
        if (error.message.includes('not found')) {
            event.node.res.statusCode = 404;
            return { success: false, message: `Post with id "${id}" not found.` };
        }
        event.node.res.statusCode = 500;
        return { success: false, message: `Failed to update post: ${error.message}` };
    }
});