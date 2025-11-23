import { createClient } from 'redis';
import { defineEventHandler, getRouterParam } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const redisUrl = config.public.redisUrl;

  // Get the slug from the URL (e.g., /api/posts/my-first-post)
  const slug = getRouterParam(event, 'slug');

  if (!redisUrl) {
    throw new Error('NUXT_REDIS_URL is not defined');
  }

  if (!slug) {
    throw new Error('Post slug is not defined');
  }

  const redis = createClient({ url: redisUrl });

  try {
    await redis.connect();

    // 1. Find the post key (e.g., 'post:123') using the slug from the 'slugs' hash.
    const postKey = await redis.hGet('slugs', slug);

    if (!postKey) {
      // If no key is found, the post doesn't exist.
      event.node.res.statusCode = 404;
      return { success: false, error: 'Post not found' };
    }

    // 2. Fetch the full post object using its key.
    const post = await redis.json.get(postKey);

    await redis.disconnect();
    
    if (!post) {
      event.node.res.statusCode = 404;
      return { success: false, error: 'Post data could not be retrieved' };
    }

    return { success: true, post };

  } catch (error) {
    if (redis.isOpen) {
      await redis.disconnect();
    }
    console.error(`Failed to fetch post with slug "${slug}":`, error);
    event.node.res.statusCode = 500;
    return { success: false, error: 'Failed to fetch post' };
  }
});
