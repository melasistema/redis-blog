/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// scripts/cli/post/delete.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import { PostService } from '../utils/post-service';
import type { PostListItem } from '../utils/post-service';
// import { getRedisClient } from '../utils/redis-client'; // No longer needed for connect/disconnect

// An interactive CLI for finding and removing a blog post.
export async function deletePostCLI() {
    const postService = new PostService();
    
    try {
        // const redisClient = await getRedisClient(); // No longer needed here as client is connected globally
        console.log(chalk.blue('Fetching posts from Redis...'));
        const posts = await postService.listPosts();

        if (!posts.length) {
            console.log(chalk.yellow('No posts are currently available to delete.'));
            return;
        }

        console.log(chalk.green(`Found ${posts.length} posts.`));

        // First, display a non-interactive list so the user has a clear
        // overview of what's available before being prompted.
        console.log(chalk.bold.cyan('\n--- Available Blog Posts ---'));
        posts.forEach((post: PostListItem, index: number) => {
            console.log(
                `${chalk.white.bold(`${index + 1}.`)} ${chalk.green(post.title)} ${ 
                    post.tags?.length ? chalk.gray(`[${post.tags.join(', ')}]`) : ''
                }`
            );
        });
        console.log(chalk.bold.cyan('----------------------------\n'));
        
        const choices = posts.map((post: PostListItem, index: number) => ({
            name: `${post.title}`,
            value: index,
        }));

        // We use a 'rawlist' here instead of 'list' because it's more compatible
        // with a wider range of terminal emulators and gracefully handles
        // numeric input, which is a natural way to select from a numbered list.
        const { selectedIndex } = await inquirer.prompt<{ selectedIndex: number }>([
            {
                type: 'rawlist',
                name: 'selectedIndex',
                message: 'Which post would you like to delete?',
                choices: choices,
                pageSize: 15,
            },
        ]);

        const postToDelete = posts[selectedIndex];

        // This check is a safeguard. In theory, inquirer should always return a
        // valid index from the choices, but it's good practice to be defensive.
        if (!postToDelete) {
            console.error(chalk.red('An unexpected error occurred: Could not find the selected post.'));
            return;
        }

        // Always ask for confirmation before a destructive operation.
        const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Are you absolutely sure you want to delete "${chalk.yellow(postToDelete.title)}"? This action cannot be undone.`,
                default: false,
            },
        ]);

        if (!confirm) {
            console.log(chalk.gray('Deletion cancelled. No changes were made.'));
            return;
        }

        console.log(chalk.blue(`Initiating deletion for "${postToDelete.title}"...`));
        await postService.deletePost(postToDelete);
        console.log(chalk.green(`✅ Successfully deleted the post: "${postToDelete.title}"`));

    } catch (err) {
        console.error(chalk.red('An error occurred while trying to delete the post:'), err);
    } finally {
        // await redisClient.disconnect(); // No longer needed here as client is disconnected globally
        // console.log(chalk.gray('Disconnected from Redis.')); // This message is now handled globally
    }
}