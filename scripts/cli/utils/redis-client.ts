// This module centralizes the creation of a Redis client.
// It ensures that all parts of the application connect to Redis using the same
// configuration, which is loaded from environment variables.
import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

export function getRedisClient() {
    const redisUrl = process.env.NUXT_REDIS_URL || 'redis://localhost:6380';
    return createClient({ url: redisUrl });
}
