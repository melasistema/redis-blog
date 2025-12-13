/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/utils/auth/types.ts

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
    id: string; // UUID
    username: string; // Unique, used for login
    email?: string; // Optional, unique
    passwordHash: string; // bcrypt hash
    roles: UserRole[];
    createdAt: number;
    updatedAt: number;
}

export interface Session {
    id: string; // Session ID (token)
    userId: string;
    createdAt: number;
    expiresAt: number;
    ipAddress?: string;
    userAgent?: string;
}
