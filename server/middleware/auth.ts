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
    console.log(`[Server Auth Middleware] Incoming request: ${event.node.req.url}`);

    // Perform authentication for admin paths and auth API paths
    const url = event.node.req.url;
    if (!(url?.startsWith('/api/admin') || url?.startsWith('/admin') || url?.startsWith('/api/auth/'))) {
        console.log(`[Server Auth Middleware] Skipping auth for: ${url}`);
        return; // Skip authentication for other paths
    }

    const sessionToken = getCookie(event, SESSION_COOKIE_NAME);
    console.log(`[Server Auth Middleware] Session Token: ${sessionToken ? 'present' : 'absent'}`);

    if (!sessionToken) {
        event.context.user = undefined; // Explicitly set to undefined if no token
        return;
    }

    const userId = await sessionManager.validateSession(sessionToken);
    console.log(`[Server Auth Middleware] User ID from session: ${userId || 'none'}`);

    if (!userId) {
        deleteCookie(event, SESSION_COOKIE_NAME);
        event.context.user = undefined;
        return;
    }

    const user = await userRepository.getById(userId);
    console.log(`[Server Auth Middleware] User fetched: ${user ? user.username : 'null'}`);

    if (!user) {
        await sessionManager.deleteSession(sessionToken);
        deleteCookie(event, SESSION_COOKIE_NAME);
        event.context.user = undefined;
        return;
    }

    event.context.user = user;
    console.log(`[Server Auth Middleware] event.context.user populated: ${event.context.user.username}`);
});
