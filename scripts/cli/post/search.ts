/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// scripts/cli/post/search.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import { PostService } from '../utils/post-service';
import type { PostListItem } from '../utils/post-service';

// An interactive CLI for finding blog posts using RediSearch.
export async function searchPostCLI() {
    const postService = new PostService();
    
    try {
        // const redisClient = await getRedisClient(); // No longer needed here as client is connected globally
        console.log(chalk.bold.cyan('\n--- Search Blog Posts ---'));

        // Prompt the user for a search query.
        const { query } = await inquirer.prompt([
            {
                type: 'input',
                name: 'query',
                message: 'Enter your search query (e.g., "redis blog", @tags:{tutorial}, @title:custom, @content:custom):',
                validate: (input) => input ? true : 'Search query cannot be empty.',
            },
        ]);

        console.log(chalk.blue(`\nSearching for "${query}"...`));
        
        // Execute the search. The RediSearch index is ensured (created if needed)
        // within the searchPosts method itself.
        const results = await postService.searchPosts(query);

        if (results.length === 0) {
            console.log(chalk.yellow('No posts found matching your query.'));
            return;
        }

        // Display the search results.
        console.log(chalk.bold.cyan('\n--- Search Results ---'));
        results.forEach((post: PostListItem, index: number) => {
            console.log(
                `${chalk.white.bold(`${index + 1}.`)} ${chalk.green(post.title)} ${
                    post.tags?.length ? chalk.gray(`[${post.tags.join(', ')}]`) : ''
                }`
            );
            console.log(chalk.gray(`   Slug: ${post.slug}`));
        });
        console.log(chalk.bold.cyan('------------------------\n'));

    } catch (err) {
        console.error(chalk.red('An error occurred during search:'), err);
    } finally {
        // await redisClient.disconnect(); // No longer needed here as client is disconnected globally
        // console.log(chalk.gray('\nDisconnected from Redis.')); // This message is now handled globally
    }
}
