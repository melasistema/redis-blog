/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/api/auth/login.post.ts

import { defineEventHandler, readBody, setCookie, getHeaders } from 'h3';
import { compare } from 'bcryptjs'; // Using bcryptjs for password comparison
import { UserRepository } from '~/server/utils/auth/user-repository';
import { getRedis } from '~/server/utils/redis';
import { sessionManager } from '~/server/utils/auth/session-manager';

const userRepository = new UserRepository(getRedis);
import type { User } from '~/server/utils/auth/types';

const SESSION_COOKIE_NAME = 'session_token';
const ADMIN_ROUTE_PREFIX = '/admin'; // Routes that require authentication

export default defineEventHandler(async (event) => {
    const { username, password } = await readBody(event);

    if (!username || !password) {
        event.node.res.statusCode = 400;
        return { success: false, message: 'Username and password are required.' };
    }

    const user = await userRepository.getByUsername(username);

    if (!user) {
        event.node.res.statusCode = 401;
        return { success: false, message: 'Invalid credentials.' };
    }

    // Compare provided password with stored hash
    const passwordMatch = await compare(password, user.passwordHash);

    if (!passwordMatch) {
        event.node.res.statusCode = 401;
        return { success: false, message: 'Invalid credentials.' };
    }

    // Credentials are valid, create a session
    const headers = getHeaders(event);
    const ipAddress = headers['x-forwarded-for'] as string || event.node.req.socket.remoteAddress;
    const userAgent = headers['user-agent'] as string;

    const sessionId = await sessionManager.createSession(user.id, ipAddress, userAgent);

    // Set HttpOnly cookie for the session token
    setCookie(event, SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: ADMIN_ROUTE_PREFIX, // Restrict cookie to admin paths
        sameSite: 'lax', // CSRF protection
    });

    // Return limited user data (excluding password hash)
    const userWithoutHash: Partial<User> = { ...user };
    delete userWithoutHash.passwordHash;

    return { success: true, message: 'Login successful.', user: userWithoutHash };
});
