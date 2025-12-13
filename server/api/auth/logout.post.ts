/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/api/auth/logout.post.ts

import { defineEventHandler, getCookie, deleteCookie } from 'h3';
import { sessionManager } from '~/server/utils/auth/session-manager';

const SESSION_COOKIE_NAME = 'session_token';
const ADMIN_ROUTE_PREFIX = '/admin'; // Cookie path

export default defineEventHandler(async (event) => {
    const sessionToken = getCookie(event, SESSION_COOKIE_NAME);

    if (sessionToken) {
        await sessionManager.deleteSession(sessionToken);
    }

    // Always clear the cookie regardless of whether a session token was found in Redis
    deleteCookie(event, SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0, // Expire the cookie immediately
        path: ADMIN_ROUTE_PREFIX,
        sameSite: 'lax',
    });

    return { success: true, message: 'Logout successful.' };
});
