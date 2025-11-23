// seed-redis.ts
import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Simple slugify function (copied from API route for consistency)
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with one -
        .replace(/^-+/, '') // Trim - from start
        .replace(/-+$/, ''); // Trim - from end
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
                title: 'Getting Started with Nuxt 3 and Redis Stack',
                content: `<h2>A Modern Stack for Web Development</h2>
          <p>This comprehensive guide introduces the basics of setting up a Nuxt 3 project with Redis Stack as your database, all orchestrated seamlessly with Docker Compose.</p>
          <p>We delve into RedisJSON for flexible document storage and explore how other Redis Stack modules like RediSearch enhance functionality.</p>
          <p>Key topics include:</p>
          <ul>
            <li>Initializing your Nuxt 3 application</li>
            <li>Integrating Redis Stack with Docker Compose</li>
            <li>Basic data operations with RedisJSON</li>
            <li>Setting up Nuxt 3 server routes for API handling</li>
          </ul>
          <p>This robust foundation ensures high performance and developer-friendly workflows for your next web project.</p>`,
                author: 'Melasistema',
                tags: ['nuxt', 'redis-stack', 'docker', 'tutorial', 'getting-started'],
            },
            {
                title: 'Understanding RedisJSON: Beyond Key-Value Pairs',
                content: `<h3>Transforming Redis into a Document Database</h3>
          <p>RedisJSON is a powerful Redis module that extends Redis's capabilities to handle JSON documents natively. This article explains how RedisJSON allows you to store, retrieve, and update complex JSON objects with atomic precision and incredible speed.</p>
          <p>Forget the limitations of simple key-value pairs when dealing with nested data. RedisJSON offers a rich set of commands to manipulate JSON paths, making it ideal for:</p>
          <ul>
            <li>Storing hierarchical user profiles</li>
            <li>Managing product catalogs with dynamic attributes</li>
            <li>Building real-time content management systems</li>
          </ul>
          <p>Explore practical examples and best practices for integrating RedisJSON into your Nuxt 3 applications.</p>`,
                author: 'Melasistema',
                tags: ['redis', 'json', 'database', 'module', 'data-modeling'],
            },
            {
                title: 'Building Scalable APIs with Nuxt 3 Server Routes',
                content: `<h4>The Power of Hybrid Rendering and Integrated APIs</h4>
          <p>Nuxt 3's server routes revolutionize how we build web applications by integrating robust API functionalities directly within your frontend project. This approach simplifies deployment and streamlines development workflows, especially when combined with powerful backends like Redis.</p>
          <p>In this post, we cover:</p>
          <ol>
            <li>The architecture of Nuxt 3 server routes (Nitro).</li>
            <li>How to define API endpoints (<code>/server/api</code>).</li>
            <li>Connecting server routes to a Redis database for data fetching and manipulation.</li>
            <li>Strategies for authentication and authorization within this unified architecture.</li>
          </ol>
          <p>Learn how to leverage this feature to create performant and maintainable APIs that seamlessly serve your Nuxt 3 application.</p>`,
                author: 'Melasistema',
                tags: ['nuxt', 'api', 'server', 'performance', 'architecture'],
            },
            {
                title: 'Dockerizing Your Nuxt.js Application: A Comprehensive Guide',
                content: `<h5>Containerization Best Practices for Production Readiness</h5>
          <p>Containerizing your Nuxt.js application with Docker ensures consistency across development, staging, and production environments. This guide walks you through the process of creating an efficient multi-stage Dockerfile and integrating it with Docker Compose for a complete, production-ready setup.</p>
          <p>We'll cover:</p>
          <ul>
            <li>Setting up a multi-stage Dockerfile for a lean Nuxt build.</li>
            <li>Configuring <code>docker-compose.yml</code> to orchestrate Nuxt and Redis Stack services.</li>
            <li>Managing environment variables securely within Docker.</li>
            <li>Optimizing Docker images for smaller size and faster deployments.</li>
          </ul>
          <p>Mastering Docker is key to modern web development, providing isolation, scalability, and ease of deployment.</p>`,
                author: 'Melasistema',
                tags: ['docker', 'deployment', 'nuxt', 'containerization', 'devops'],
            },
            {
                title: 'Exploring RediSearch: Full-Text Search for Your Blog',
                content: `<h6>Fast and Flexible Search Capabilities</h6>
          <p>Adding a powerful search functionality to your blog is crucial for user experience. RediSearch, a module within Redis Stack, provides blazing-fast full-text search, secondary indexing, and aggregation capabilities directly within your Redis database.</p>
          <p>This article demonstrates how to:</p>
          <ol>
            <li>Create RediSearch indexes on your RedisJSON documents.</li>
            <li>Perform complex search queries with filtering and sorting.</li>
            <li>Integrate RediSearch into your Nuxt 3 API routes for real-time search results.</li>
          </ol>
          <p>Enhance your blog with a search experience that rivals dedicated search engines, all while keeping your data within the high-performance Redis ecosystem.</p>`,
                author: 'Melasistema',
                tags: ['redis', 'search', 'redis-stack', 'performance', 'module', 'tutorial'],
            },
            {
                title: 'Optimizing Nuxt 3 for Performance: Tips and Tricks',
                content: `<p>Achieving top-tier performance for your web application is paramount. Nuxt 3, with its hybrid rendering capabilities, offers numerous ways to optimize loading times, responsiveness, and overall user satisfaction.</p>
          <p>This post shares practical tips, including:</p>
          <ul>
            <li>Code splitting and lazy loading components.</li>
            <li>Image optimization strategies.</li>
            <li>Leveraging Nuxt's data fetching (<code>useAsyncData</code>, <code>useFetch</code>) effectively.</li>
            <li>Caching strategies with Redis for API responses.</li>
          </ul>
          <p>Implement these techniques to ensure your Nuxt 3 blog delivers an exceptionally fast and fluid experience.</p>`,
                author: 'Melasistema',
                tags: ['nuxt', 'performance', 'optimization', 'caching', 'frontend'],
            },
            {
                title: 'Deploying a Nuxt 3 + Redis Blog to Production',
                content: `<p>Taking your Nuxt 3 and Redis-powered blog from development to a live production environment requires careful planning. This article outlines key considerations and steps for a successful deployment.</p>
          <p>Topics include:</p>
          <ul>
            <li>Choosing a hosting provider (e.g., AWS, DigitalOcean, Vercel).</li>
            <li>Configuring environment variables for production.</li>
            <li>Setting up CI/CD pipelines.</li>
            <li>Monitoring your application and Redis instance.</li>
          </ul>
          <p>Ensure your blog is robust, secure, and ready to handle real-world traffic.</p>`,
                author: 'Melasistema',
                tags: ['deployment', 'production', 'devops', 'nuxt', 'redis'],
            },
        ];

        for (const postData of examplePosts) {
            const id = Math.random().toString(36).substring(2, 12);
            const slug = slugify(postData.title);

            // Generate random creation dates (within last 30 days)
            const createdAt = new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString();

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
            if (post.tags?.length) {
                for (const tag of post.tags) {
                    multi.sAdd('tags:all', tag);
                    multi.sAdd(`tag:${slugify(tag)}`, postKey);
                }
            }

            await multi.exec();
            console.log(`Seeded post: "${post.title}" with key "${postKey}"`);
        }

        console.log('Redis seeding complete!');
        await redis.save();
        console.log('Redis data saved to disk.');
    } catch (error) {
        console.error('Failed to seed Redis:', error);
    } finally {
        await redis.disconnect();
        console.log('Disconnected from Redis');
    }
}

seedRedis();
