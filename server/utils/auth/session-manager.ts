/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/utils/auth/session-manager.ts

import { v4 as uuidv4 } from 'uuid';
import { getRedis } from '~/server/utils/redis';
import type { Session } from './types';
import type { RedisClientType } from 'redis';

// Session expiration time in seconds (e.g., 1 day)
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24;

export class SessionManager {
    constructor(private getRedisClient: () => Promise<RedisClientType>) {}

    private async redis() {
        return this.getRedisClient();
    }

    async createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
        const redis = await this.redis();
        const sessionId = uuidv4();
        const now = Date.now();
        const expiresAt = now + SESSION_EXPIRATION_SECONDS * 1000;

        const session: Session = {
            id: sessionId,
            userId,
            createdAt: now,
            expiresAt,
            ipAddress,
            userAgent,
        };

        const key = `session:${sessionId}`;
        // Store session data as a Redis Hash
        await redis.hSet(key, session as any); // Type assertion for hSet
        await redis.expire(key, SESSION_EXPIRATION_SECONDS);

        return sessionId;
    }

    async validateSession(sessionId: string): Promise<string | null> {
        const redis = await this.redis();
        const key = `session:${sessionId}`;
        const sessionData = await redis.hGetAll(key);

        if (!sessionData || Object.keys(sessionData).length === 0) {
            return null; // Session not found or expired
        }

        // We can optionally check expiresAt here, but Redis EXPIRE handles it
        // However, hGetAll returns strings, so we need to cast userId
        return sessionData.userId || null;
    }

    async deleteSession(sessionId: string): Promise<void> {
        const redis = await this.redis();
        const key = `session:${sessionId}`;
        await redis.del(key);
    }
}

export const sessionManager = new SessionManager(getRedis);
