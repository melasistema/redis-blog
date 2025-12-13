/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { useRuntimeConfig } from '#imports';

let client: RedisClientType | null = null;

export const getRedis = async () => {
    if (client && client.isOpen) return client;

    const config = useRuntimeConfig();
    const redisUrl = config.public.redisUrl; // Get from runtimeConfig

    if (!redisUrl) {
        throw new Error('REDIS_URL environment variable is not set. Please provide a Redis connection string in nuxt.config.ts and your .env file.');
    }

    client = createClient({ url: redisUrl });

    client.on('error', (err) => {
        console.error('REDIS ERROR:', err);
    });

    if (!client.isOpen) {
        await client.connect();
    }

    return client;
};