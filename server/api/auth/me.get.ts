/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/api/auth/me.get.ts

import { defineEventHandler } from 'h3';
import type { User } from '~/server/utils/auth/types';

export default defineEventHandler(async (event) => {
    // This route is protected by the auth middleware, so event.context.user should be populated.
    if (!event.context.user) {
        event.node.res.statusCode = 401;
        return { success: false, message: 'Unauthorized.' };
    }

    // Return limited user data (excluding password hash)
    const userWithoutHash: Partial<User> = { ...event.context.user };
    delete userWithoutHash.passwordHash;

    return { success: true, user: userWithoutHash };
});
