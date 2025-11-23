import { createClient } from 'redis';
import { defineEventHandler } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const redisUrl = config.public.redisUrl;

  if (!config.public.redisHost || !config.public.redisPort) {
    throw new Error('REDIS_HOST or REDIS_PORT is not defined');
  }

  const redis = createClient({
    socket: {
      host: config.public.redisHost,
      port: config.public.redisPort
    }
  });

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
