/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// scripts/cli/post/new.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as readline from 'readline';
import { PostService } from '../utils/post-service';
// import { getRedisClient } from '../utils/redis-client'; // No longer needed for connect/disconnect

// Inquirer is great for structured prompts, but not for free-form multi-line
// input. For that, we use Node's `readline` module directly. This function
// creates a temporary `readline` interface to capture lines until a terminator
// is found, then closes it to prevent conflicts with Inquirer's own interface.
const getMultiLineInput = (prompt: string, terminator: string): Promise<string> => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const lines: string[] = [];
        console.log(chalk.yellow(`${prompt} (type '${terminator}' on a new line to finish)`));

        rl.on('line', (line) => {
            if (line.trim() === terminator) {
                rl.close();
                resolve(lines.join('\n'));
            } else {
                lines.push(line);
            }
        });
        
        // Handle Ctrl+C gracefully, as it would otherwise leave the process hanging.
        rl.on('SIGINT', () => {
            console.log(chalk.red('\nInput cancelled.'));
            rl.close();
            resolve('');
        });
    });
};

// An interactive CLI for creating a new blog post.
export async function createPostCLI() {
    const postService = new PostService();

    try {
        console.log(chalk.bold.cyan('--- Create a New Blog Post ---'));

        // We break the prompts into multiple sections. First, get the title.
        const { title } = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Post Title:',
                validate: (input) => input ? true : 'Title cannot be empty.',
            },
        ]);

        // Then, drop out of Inquirer to use our custom readline-based function
        // for the post's main content.
        const content = await getMultiLineInput('Post Content:', '(end)');

        // Add new prompts for excerpt and image
        const { excerpt, image } = await inquirer.prompt([
            {
                type: 'input',
                name: 'excerpt',
                message: 'Post Excerpt (optional, for SEO):',
                default: '', // Make it optional
            },
            {
                type: 'input',
                name: 'image',
                message: 'Featured Image URL (optional, for Open Graph):',
                default: '', // Make it optional
            },
        ]);

        const { tags, author } = await inquirer.prompt([
            {
                type: 'input',
                name: 'tags',
                message: 'Tags (comma-separated):',
            },
            {
                type: 'input',
                name: 'author',
                message: 'Author:',
                default: process.env.DEFAULT_AUTHOR || 'CLI User',
            },
        ]);

        const postData = {
            title: title,
            content: content,
            excerpt: excerpt || content.substring(0, 150), // Use provided excerpt or generate from content
            image: image || null, // Use provided image or null
            author: author,
            tags: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
            createdAt: Date.now(), // Add createdAt timestamp
        };

        // const redisClient = await getRedisClient(); // No longer needed here as client is connected globally
        console.log(chalk.blue('\nSaving post to Redis...'));

        const newPost = await postService.createPost(postData);

        console.log(chalk.green('\n✅ Successfully created new post!'));
        console.log(chalk.white(`   - Title: ${newPost.title}`));
        console.log(chalk.white(`   - Author: ${newPost.author}`));
        console.log(chalk.white(`   - Slug: ${newPost.slug}`));
        if (newPost.excerpt) console.log(chalk.white(`   - Excerpt: ${newPost.excerpt.substring(0, 50)}...`));
        if (newPost.image) console.log(chalk.white(`   - Image: ${newPost.image}`));
        console.log(chalk.white(`   - Tags: ${newPost.tags?.join(', ')}`));
        console.log(chalk.white(`   - Created At: ${new Date(newPost.createdAt).toLocaleString()}`));

    } catch (err) {
        console.error(chalk.red('An error occurred while creating the post:'), err);
    } finally {
        // await redisClient.disconnect(); // No longer needed here as client is disconnected globally
        // console.log(chalk.gray('\nDisconnected from Redis.')); // This message is now handled globally
    }
}