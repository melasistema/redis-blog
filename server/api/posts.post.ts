/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineEventHandler, readBody } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';
import { getRedis } from '~/server/utils/redis';
import type { Post } from '~/server/repositories/PostRepository';

export default defineEventHandler(async (event) => {
    // Ensure only authenticated users with 'admin' role can create posts
    if (!event.context.user || !event.context.user.roles?.includes('admin')) {
        event.node.res.statusCode = 403;
        return { success: false, message: 'Forbidden. Only administrators can create posts.' };
    }

    const postData = await readBody(event) as Pick<Post, 'title' | 'content' | 'excerpt' | 'image' | 'author' | 'tags' | 'createdAt'>;

    // Basic validation
    if (!postData || !postData.title || !postData.content || !postData.createdAt) {
        event.node.res.statusCode = 400;
        return { success: false, message: 'Invalid post data provided. Title, content, and createdAt are required.' };
    }

    const postRepository = new PostRepository(getRedis);

    try {
        const newPost = await postRepository.createPost(postData);

        event.node.res.statusCode = 201; // Set status code to 201 Created
        return { success: true, message: `Post "${newPost.title}" created successfully.`, post: newPost };
    } catch (error: any) {
        console.error('Error creating post:', error);
        event.node.res.statusCode = 500;
        return { success: false, message: `Failed to create post: ${error.message}` };
    }
});
