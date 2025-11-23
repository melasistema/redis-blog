// seed-redis.ts
import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Simple slugify function (copied from API route for consistency)
function slugify(text: string): string {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
}

async function seedRedis() {
  const redisUrl = process.env.NUXT_REDIS_URL || 'redis://localhost:6380';
  const redis = createClient({ url: redisUrl });

  redis.on('error', (err) => console.error('Redis Client Error', err));

  try {
    await redis.connect();
    console.log('Connected to Redis');

    // Clear existing data for a fresh seed
    await redis.flushAll();
    console.log('Cleared all existing Redis data.');

    const examplePosts = [
      {
        title: 'Getting Started with Nuxt 3 and Redis',
        content: '<h2>A Modern Stack for Web Development</h2><p>This post covers the basics of setting up a Nuxt 3 project with Redis as a database, all orchestrated with Docker Compose.</p><p>We use RedisJSON for flexible data storage and Redis Stack for additional modules like RediSearch.</p>',
        author: 'Melasistema',
        tags: ['nuxt', 'redis', 'docker', 'tutorial'],
      },
      {
        title: 'Understanding RedisJSON for Document Storage',
        content: '<h3>Beyond Key-Value Pairs</h3><p>RedisJSON transforms Redis into a powerful document database. Learn how to store, retrieve, and update complex JSON objects efficiently.</p>',
        author: 'Melasistema',
        tags: ['redis', 'json', 'database', 'module'],
      },
      {
        title: 'Building Scalable APIs with Nuxt 3 Server Routes',
        content: '<h4>The Power of Hybrid Rendering</h4><p>Nuxt 3\'s server routes provide a flexible way to build robust APIs directly within your frontend project. Discover how to connect them to your backend services like Redis.</p>',
        author: 'Melasistema',
        tags: ['nuxt', 'api', 'server', 'performance'],
      },
      {
        title: 'Dockerizing Your Nuxt.js Application',
        content: '<h5>Containerization Best Practices</h5><p>Learn how to create a multi-stage Dockerfile for your Nuxt.js app to ensure a lean, production-ready image. Integrate it seamlessly with Redis using Docker Compose.</p>',
        author: 'Melasistema',
        tags: ['docker', 'deployment', 'nuxt', 'container'],
      },
    ];

    for (const postData of examplePosts) {
      const id = Math.random().toString(36).substring(2, 12);
      const slug = slugify(postData.title);
      // Generate random creation dates for better sorting visibility
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(); // within last 30 days

      const post = {
        id,
        slug,
        title: postData.title,
        content: postData.content,
        author: postData.author,
        tags: postData.tags,
        createdAt,
        published: true,
      };

      const postKey = `post:${id}`;
      const createdAtTimestamp = new Date(post.createdAt).getTime();

      const multi = redis.multi();
      multi.json.set(postKey, '$', post as any);
      multi.zAdd('posts:by_date', {
        score: createdAtTimestamp,
        value: postKey,
      });
      multi.hSet('slugs', slug, postKey);

      // Add tags to global and tag-specific SETs
      if (post.tags && post.tags.length > 0) {
        for (const tag of post.tags) {
          multi.sAdd('tags:all', tag); // Add tag to the global set of all tags
          multi.sAdd(`tag:${slugify(tag)}`, postKey); // Add postKey to the set for this specific tag
        }
      }
      await multi.exec();

      console.log(`Seeded post: "${post.title}" with key "${postKey}"`);
    }

    console.log('Redis seeding complete!');
  } catch (error) {
    console.error('Failed to seed Redis:', error);
  } finally {
    await redis.disconnect();
    console.log('Disconnected from Redis');
  }
}

seedRedis();
