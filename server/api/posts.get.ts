import { defineEventHandler } from 'h3';
import { getRedis } from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const redis = await getRedis();

  if (event.node.req.method === 'GET') {
    try {
      // 1. Get the keys of the 20 most recent posts from the sorted set
      const postKeys = await redis.zRange('posts:by_date', 0, 19, { REV: true });

      if (postKeys.length === 0) {
        return { success: true, posts: [] };
      }

      // 2. Fetch the full JSON object for each post key
      // Using multi.json.get() ensures we fetch all posts in a single round-trip
      const multi = redis.multi();
      postKeys.forEach(key => {
        multi.json.get(key);
      });
      
      const posts = await multi.exec();

      // Filter out any potential null results if a key was deleted between Z-RANGE and GET
      const validPosts = posts.filter(p => p !== null);

      return { success: true, posts: validPosts };
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return { success: false, error: 'Failed to fetch posts' };
    }
  }

  // Fallback for other methods
  return { success: false, error: 'Method not allowed' };
});
