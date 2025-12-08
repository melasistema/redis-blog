// This module centralizes the creation of a Redis client.
// It ensures that all parts of the application connect to Redis using the same
// configuration, which is loaded from environment variables.
import { createClient } from 'redis';
import type { RedisClientType } from 'redis'; // Import RedisClientType
import * as dotenv from 'dotenv';

dotenv.config();

let client: RedisClientType | null = null; // Declare a client variable

export function getRedisClient(): RedisClientType { // Specify return type
    if (client && client.isOpen) {
        return client;
    }

    const redisUrl = process.env.NUXT_REDIS_URL || 'redis://localhost:6380';
    client = createClient({ url: redisUrl });

    // Optional: Add error handling for the client
    client.on('error', (err) => {
        console.error('CLI Redis Client Error:', err);
    });

    return client;
}
