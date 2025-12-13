/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/utils/auth/user-repository.ts

import { v4 as uuidv4 } from 'uuid';

import type { User, UserRole } from './types';
import type { RedisClientType } from 'redis'; // Import RedisClientType

// --- RediSearch Schema for Users ---
const USER_SEARCH_INDEX = 'idx:users';
const userSchema = {
    '$.id': { type: 'TAG' as const, AS: 'id' },
    '$.username': { type: 'TAG' as const, AS: 'username' }, // Use TAG for exact username search
    '$.email': { type: 'TAG' as const, AS: 'email' },     // Use TAG for exact email search
    '$.roles': { type: 'TAG' as const, AS: 'roles' },
};
const userSchemaOptions = { ON: 'JSON' as const, PREFIX: 'user:' as const, STOPWORDS: [] as string[] };

export class UserRepository {
    constructor(private getRedisClient: () => Promise<RedisClientType>) {}

    private async redis() {
        return this.getRedisClient();
    }

    async ensureSearchIndex() {
        const redis = await this.redis();
        try {
            await redis.ft.info(USER_SEARCH_INDEX);
        } catch (err: any) {
            if (String(err).includes('Unknown index name')) {
                // Use type assertion to bypass TypeScript error for schema and options
                await redis.ft.create(USER_SEARCH_INDEX, userSchema as any, userSchemaOptions as any);
            } else {
                throw err;
            }
        }
    }

    async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const redis = await this.redis();
        const id = uuidv4();
        const now = Date.now();
        const user: User = {
            id,
            ...userData,
            createdAt: now,
            updatedAt: now,
        };
        const key = `user:${id}`;
        await redis.json.set(key, '$', user as any); // Use as any to bypass RedisJSON type issues
        await this.ensureSearchIndex(); // Ensure index is created/updated
        return user;
    }

    async getById(id: string): Promise<User | null> {
        const redis = await this.redis();
        const key = `user:${id}`;
        return redis.json.get(key) as Promise<User | null>;
    }

    async getByUsername(username: string): Promise<User | null> {
        const redis = await this.redis();
        await this.ensureSearchIndex();
        const searchResults = await redis.ft.search(
            USER_SEARCH_INDEX,
            `@username:{${username}}`,
            {
                LIMIT: { from: 0, size: 1 }, // We only expect one result
            }
        );

        if (searchResults.total === 0) {
            return null;
        }

        // Assuming doc.value is the User object, similar to PostRepository
        return searchResults.documents[0].value as unknown as User;
    }

    // TODO: Implement update and delete methods
}


