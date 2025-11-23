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

  await redis.connect();

  if (event.node.req.method === 'GET') {
    try {
      // 1. Get the keys of the 20 most recent posts from the sorted set
      const postKeys = await redis.zRange('posts:by_date', 0, 19, { REV: true });

      if (postKeys.length === 0) {
        await redis.disconnect();
        return { success: true, posts: [] };
      }

      // 2. Fetch the full JSON object for each post key
      // Using multi.json.get() ensures we fetch all posts in a single round-trip
      const multi = redis.multi();
      postKeys.forEach(key => {
        multi.json.get(key);
      });
      
      const posts = await multi.exec();

      await redis.disconnect();

      // Filter out any potential null results if a key was deleted between Z-RANGE and GET
      const validPosts = posts.filter(p => p !== null);

      return { success: true, posts: validPosts };
    } catch (error) {
      await redis.disconnect();
      console.error('Failed to fetch posts:', error);
      return { success: false, error: 'Failed to fetch posts' };
    }
  }

  // Fallback for other methods
  await redis.disconnect();
  return { success: false, error: 'Method not allowed' };
});
