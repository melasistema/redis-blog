import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string) => new Promise<string>((resolve) => rl.question(query, resolve));

const getMultiLineInput = (prompt: string, terminator: string): Promise<string> => {
    return new Promise((resolve) => {
        const lines: string[] = [];
        console.log(`${prompt} (type '${terminator}' on a new line to finish)`);
        rl.on('line', (line) => {
            if (line.trim() === terminator) {
                rl.removeAllListeners('line');
                resolve(lines.join('\n'));
            } else {
                lines.push(line);
            }
        });
    });
};

async function createPost() {
    const redisUrl = process.env.NUXT_REDIS_URL || 'redis://localhost:6380';
    const redis = createClient({ url: redisUrl });

    redis.on('error', (err) => console.error('Redis Client Error', err));

    try {
        await redis.connect();
        console.log('Connected to Redis');

        const title = await question('Title: ');
        const content = await getMultiLineInput('Content:', '(end)');
        const tagsStr = await question('Tags (comma-separated): ');
        const defaultAuthor = process.env.DEFAULT_AUTHOR || 'CLI User';
        const author = await question(`Author (${defaultAuthor}): `) || defaultAuthor;

        const tags = tagsStr.split(',').map(tag => tag.trim());
        const id = Math.random().toString(36).substring(2, 12);
        const slug = slugify(title);
        const createdAt = new Date().toISOString();

        const post = {
            id,
            slug,
            title,
            content,
            author,
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
        rl.close();
        await redis.save();
        await redis.disconnect();
        console.log('Disconnected from Redis');
    }
}

createPost();