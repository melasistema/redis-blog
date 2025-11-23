import { defineEventHandler } from 'h3';
import { getRedis } from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const redis = await getRedis();

  try {
    // Retrieve all unique tags from the 'tags:all' SET
    const tags = await redis.sMembers('tags:all');

    return { success: true, tags };

  } catch (error) {
    console.error('Failed to fetch tags:', error);
    event.node.res.statusCode = 500;
    return { success: false, error: 'Failed to fetch tags' };
  }
});
