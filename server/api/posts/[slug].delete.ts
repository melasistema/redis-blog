/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/api/posts/[slug].delete.ts

import { defineEventHandler, getRouterParam } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';
import { getRedis } from '~/server/utils/redis';
import { rm } from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
    // Authentication checks
    if (!event.context.user || !event.context.user.roles?.includes('admin')) {
        event.node.res.statusCode = 403;
        return { success: false, message: 'Forbidden. Only administrators can delete posts.' };
    }

    const slug = getRouterParam(event, 'slug');
    if (!slug) {
        event.node.res.statusCode = 400;
        return { success: false, message: 'Slug parameter is required.' };
    }

    const postRepository = new PostRepository(getRedis);

    try {
        const { deleted, postId } = await postRepository.delete(slug);

        if (deleted && postId) {
            // If post was deleted from Redis, also delete its image assets directory
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'posts', postId);
            try {
                await rm(uploadDir, { recursive: true, force: true });
                console.log(`Deleted post assets directory: ${uploadDir}`);
            } catch (fsError: any) {
                // Log the error, but don't fail the request if the DB deletion was successful.
                // The directory might not exist, which is fine.
                console.error(`Failed to delete post assets directory for postId ${postId}:`, fsError);
            }
            return { success: true, message: `Post with slug "${slug}" deleted successfully.` };
        } else {
            event.node.res.statusCode = 404;
            return { success: false, message: `Post with slug "${slug}" not found.` };
        }
    } catch (error: any) {
        event.node.res.statusCode = 500;
        return { success: false, message: `Failed to delete post: ${error.message}` };
    }
});