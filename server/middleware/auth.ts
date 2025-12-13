/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/middleware/auth.ts

import { defineEventHandler, getCookie, deleteCookie } from 'h3';
import { sessionManager } from '~/server/utils/auth/session-manager';
import { UserRepository } from '~/server/utils/auth/user-repository';
import { getRedis } from '~/server/utils/redis';

const userRepository = new UserRepository(getRedis);

const SESSION_COOKIE_NAME = 'session_token';

export default defineEventHandler(async (event) => {
    // Check if the request is for a static asset or public API/page
    // For simplicity, we'll protect '/admin' routes and API routes that need authentication
    // You might want a more sophisticated route protection mechanism
    if (!event.node.req.url?.startsWith('/api/admin') && !event.node.req.url?.startsWith('/admin')) {
        return; // Skip authentication for non-admin paths
    }

    const sessionToken = getCookie(event, SESSION_COOKIE_NAME);

    if (!sessionToken) {
        // No session token, user is not authenticated for protected routes
        return;
    }

    const userId = await sessionManager.validateSession(sessionToken);

    if (!userId) {
        // Invalid or expired session, clear the cookie
        deleteCookie(event, SESSION_COOKIE_NAME);
        return;
    }

    const user = await userRepository.getById(userId);

    if (!user) {
        // User not found for valid session, clear the session and cookie
        await sessionManager.deleteSession(sessionToken);
        deleteCookie(event, SESSION_COOKIE_NAME);
        return;
    }

    // Attach the user object to the event context for subsequent handlers
    event.context.user = user;
});
