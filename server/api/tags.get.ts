import { createClient } from 'redis';
import { defineEventHandler } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const redisUrl = config.public.redisUrl;

  if (!redisUrl) {
    throw new Error('NUXT_REDIS_URL is not defined');
  }

  const redis = createClient({ url: redisUrl });

  try {
    await redis.connect();

    // Retrieve all unique tags from the 'tags:all' SET
    const tags = await redis.sMembers('tags:all');

    await redis.disconnect();

    return { success: true, tags };

  } catch (error) {
    if (redis.isOpen) {
      await redis.disconnect();
    }
    console.error('Failed to fetch tags:', error);
    event.node.res.statusCode = 500;
    return { success: false, error: 'Failed to fetch tags' };
  }
});
