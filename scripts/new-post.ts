
import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function createPost() {
    const redisUrl = process.env.NUXT_REDIS_URL || 'redis://localhost:6380';
    const redis = createClient({ url: redisUrl });

    redis.on('error', (err) => console.error('Redis Client Error', err));

    try {
        await redis.connect();
        console.log('Connected to Redis');

        const args = process.argv.slice(2);
        if (args.length < 3) {
            console.error('Usage: tsx scripts/new-post.ts <title> <content> <tags>');
            process.exit(1);
        }

        const [title, content, tagsStr] = args;
        const tags = tagsStr.split(',').map(tag => tag.trim());

        const id = Math.random().toString(36).substring(2, 12);
        const slug = slugify(title);
        const createdAt = new Date().toISOString();

        const post = {
            id,
            slug,
            title,
            content,
            author: 'CLI', 
            tags,
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

        if (post.tags?.length) {
            for (const tag of post.tags) {
                multi.sAdd('tags:all', tag);
                multi.sAdd(`tag:${slugify(tag)}`, postKey);
            }
        }

        await multi.exec();
        console.log(`Successfully created post: "${post.title}" with key "${postKey}"`);

    } catch (error) {
        console.error('Failed to create post:', error);
    } finally {
        await redis.disconnect();
        console.log('Disconnected from Redis');
    }
}

createPost();
