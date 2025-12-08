// scripts/cli/post/list.ts
import chalk from 'chalk';
import { PostService } from '../utils/post-service';
import type { PostListItem } from '../utils/post-service';
import { getRedisClient } from '../utils/redis-client'; // Import getRedisClient

// A simple, non-interactive command to display all posts in the database.
export async function listPostsCLI() {
    const postService = new PostService();

    try {
        await getRedisClient().connect(); // Connect Redis client
        console.log(chalk.blue('Fetching all blog posts...'));

        const posts = await postService.listPosts();

        if (posts.length === 0) {
            console.log(chalk.yellow('No posts found in Redis.'));
            return;
        }

        console.log(chalk.bold.cyan('\n--- Available Blog Posts ---'));
        posts.forEach((post: PostListItem, index: number) => {
            console.log(
                `${chalk.white.bold(`${index + 1}.`)} ${chalk.green(post.title)} ${
                    post.tags?.length ? chalk.gray(`[${post.tags.join(', ')}]`) : ''
                }`
            );
        });
        console.log(chalk.bold.cyan('----------------------------\n'));

    } catch (error) {
        console.error(chalk.red('Failed to list posts:'), error);
    } finally {
        await getRedisClient().disconnect(); // Disconnect Redis client
        console.log(chalk.gray('Disconnected from Redis.'));
    }
}