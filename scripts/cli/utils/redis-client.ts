// This module centralizes the creation of a Redis client.
// It ensures that all parts of the application connect to Redis using the same
// configuration, which is loaded from environment variables.
import { createClient } from 'redis';
import type { RedisClientType } from 'redis'; // Import RedisClientType
import * as dotenv from 'dotenv';

dotenv.config();

let client: RedisClientType | null = null; // Declare a client variable

export async function getRedisClient(): Promise<RedisClientType> {
    if (client && client.isOpen) {
        return client;
    }

    const redisUrl = process.env.REDIS_URL; // Use REDIS_URL directly
    if (!redisUrl) {
        throw new Error('REDIS_URL environment variable is not set. Please provide a Redis connection string.');
    }
    client = createClient({ url: redisUrl });

    client.on('error', (err) => {
        console.error('CLI Redis Client Error:', err);
    });

    // We no longer connect here. The main CLI loop will handle connection/disconnection.
    return client;
}
