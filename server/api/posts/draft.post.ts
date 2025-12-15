/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineEventHandler } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';
import { getRedis } from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
    // 1. Authentication
    if (!event.context.user || !event.context.user.roles?.includes('admin')) {
        event.node.res.statusCode = 403;
        return { success: false, message: 'Forbidden. Only administrators can create posts.' };
    }

    const postRepository = new PostRepository(getRedis);
    const author = event.context.user.username || 'Admin';

    try {
        const draftPost = await postRepository.createPost({
            title: `Untitled Draft - ${new Date().toISOString()}`,
            content: 'Start writing your post here...',
            author: author,
            tags: [],
            createdAt: Date.now(),
        });
        
        event.node.res.statusCode = 201; // Created
        return { success: true, post: draftPost };

    } catch (error: any) {
        console.error('Failed to create draft post:', error);
        event.node.res.statusCode = 500;
        return { success: false, message: `Failed to create draft post: ${error.message}` };
    }
});
