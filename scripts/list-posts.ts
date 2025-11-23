
import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

async function listPosts() {
    const redisUrl = process.env.NUXT_REDIS_URL || 'redis://localhost:6380';
    const redis = createClient({ url: redisUrl });

    redis.on('error', (err) => console.error('Redis Client Error', err));

    try {
        await redis.connect();
        console.log('Connected to Redis');

        const keys = await redis.zRange('posts:by_date', 0, -1, { REV: true });

        if (keys.length === 0) {
            console.log('No posts found.');
            return;
        }

        const multi = redis.multi();
        for (const key of keys) {
            multi.json.get(key);
        }
        const results = await multi.exec();

        console.log('--- Blog Posts ---');
        results.forEach((post: any, index: number) => {
            if (post) {
                console.log(`${index + 1}. ${post.title}`);
            }
        });
        console.log('------------------');

    } catch (error) {
        console.error('Failed to list posts:', error);
    } finally {
        await redis.disconnect();
        console.log('Disconnected from Redis');
    }
}

listPosts();
