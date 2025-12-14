/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineEventHandler, getRouterParam } from 'h3';
import { PostRepository } from '~/server/repositories/PostRepository';
import { getRedis } from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
    // Ensure only authenticated users can delete posts
    if (!event.context.user) {
        event.node.res.statusCode = 401;
        return { success: false, message: 'Unauthorized. Please log in.' };
    }

    // Ensure the authenticated user has 'admin' role
    if (!event.context.user.roles?.includes('admin')) {
        event.node.res.statusCode = 403;
        return { success: false, message: 'Forbidden. Only administrators can delete posts.' };
    }

    const slug = getRouterParam(event, 'slug');
    const postRepository = new PostRepository(getRedis);

    if (!slug) {
        event.node.res.statusCode = 400;
        return { success: false, message: 'Slug parameter is required.' };
    }

    try {
        const deleted = await postRepository.delete(slug);

        if (deleted) {
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
