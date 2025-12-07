
import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import { printBanner } from '~/scripts/cli-banner';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string) => new Promise<string>((resolve) => rl.question(query, resolve));

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

async function deletePost() {

    printBanner();

    const redisUrl = process.env.NUXT_REDIS_URL || 'redis://localhost:6380';
    const redis = createClient({ url: redisUrl });

    redis.on('error', (err) => console.error('Redis Client Error', err));

    try {
        await redis.connect();
        console.log('Connected to Redis');

        const keys = await redis.zRange('posts:by_date', 0, -1, { REV: true });

        if (keys.length === 0) {
            console.log('No posts found to delete.');
            return;
        }

        const multi = redis.multi();
        for (const key of keys) {
            multi.json.get(key);
        }
        const posts = (await multi.exec()) as any[];

        console.log('--- Select a Post to Delete ---');
        posts.forEach((post: any, index: number) => {
            if (post) {
                console.log(`${index + 1}. ${post.title}`);
            }
        });
        console.log('-----------------------------');

        const selection = await question('Enter the number of the post to delete (or type "cancel"): ');

        if (selection.toLowerCase() === 'cancel') {
            console.log('Delete operation cancelled.');
            return;
        }

        const postIndex = parseInt(selection) - 1;

        if (isNaN(postIndex) || postIndex < 0 || postIndex >= posts.length) {
            console.error('Invalid selection.');
            return;
        }

        const postToDelete = posts[postIndex];
        const postKey = keys[postIndex];

        if (!postToDelete || !postKey) {
            console.error('Invalid post selection.');
            return;
        }
        
        const confirm = await question(`Are you sure you want to delete "${postToDelete.title}"? (y/n): `);

        if (confirm.toLowerCase() !== 'y') {
            console.log('Delete operation cancelled.');
            return;
        }

        const deleteMulti = redis.multi();

        deleteMulti.del(postKey);
        deleteMulti.zRem('posts:by_date', postKey);
        deleteMulti.hDel('slugs', postToDelete.slug);

        if (postToDelete.tags?.length) {
            for (const tag of postToDelete.tags) {
                deleteMulti.sRem(`tag:${slugify(tag)}`, postKey);
            }
        }

        await deleteMulti.exec();
        await redis.save();

        console.log(`Successfully deleted post: "${postToDelete.title}"`);

    } catch (error) {
        console.error('Failed to delete post:', error);
    } finally {
        rl.close();
        await redis.disconnect();
        console.log('Disconnected from Redis');
    }
}

deletePost();
