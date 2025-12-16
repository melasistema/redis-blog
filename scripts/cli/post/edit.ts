/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// scripts/cli/post/edit.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import { PostService } from '../utils/post-service';
import type { Post } from '../utils/post-service';

// An interactive CLI function to select and edit an existing blog post.
export async function editPostCLI() {
    const postService = new PostService();
    
    try {
        console.log(chalk.blue('Fetching posts to edit...'));
        
        // 1. Fetch the list of posts to select from.
        const posts = await postService.listPosts();

        if (!posts.length) {
            console.log(chalk.yellow('No posts are available to edit.'));
            return;
        }

        // 2. Prompt the user to select a post.
        const choices = posts.map((post, index) => ({
            name: post.title,
            value: index, // Return the index for easy lookup.
        }));

        const { selectedIndex } = await inquirer.prompt<{ selectedIndex: number }>([
            {
                type: 'rawlist',
                name: 'selectedIndex',
                message: 'Which post would you like to edit?',
                choices: choices,
            },
        ]);

        const selectedPostSummary = posts[selectedIndex];

        // 3. Fetch the full details of the selected post, including its content.
        console.log(chalk.blue(`\nLoading full post data for "${selectedPostSummary.title}"...`));
        const postToEdit = await postService.getPost(selectedPostSummary.slug);

        if (!postToEdit) {
            console.error(chalk.red('Could not fetch the full post. It may have been deleted.'));
            return;
        }

        console.log(chalk.cyan('Current post data is loaded. You can now make your edits.'));
        
        // 4. Use Inquirer to prompt for edits, with current values as defaults.
        const updatedAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Post Title:',
                default: postToEdit.title,
                validate: (input) => input ? true : 'Title cannot be empty.',
            },
            {
                type: 'editor', // The 'editor' type is best for multi-line content.
                name: 'content',
                message: 'Post Content (opens in your default text editor):',
                default: postToEdit.content,
            },
            {
                type: 'input',
                name: 'featured_image',
                message: 'Featured Image URL:',
                default: postToEdit.featured_image,
            },
            {
                type: 'input',
                name: 'tags',
                message: 'Tags (comma-separated):',
                default: postToEdit.tags?.join(', '),
            },
            {
                type: 'input',
                name: 'author',
                message: 'Author:',
                default: postToEdit.author,
            },
        ]);

        // 5. Construct the final updated post object.
        const updatedPost: Partial<Post> = {
            title: updatedAnswers.title,
            content: updatedAnswers.content,
            author: updatedAnswers.author,
            tags: updatedAnswers.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
            featured_image: updatedAnswers.featured_image,
        };

        // 6. Call the updatePost method in PostService.
        console.log(chalk.blue('\nSaving updated post to Redis...'));
        await postService.updatePost(postToEdit.id, updatedPost);

        console.log(chalk.green('\n✅ Successfully updated the post!'));
        console.log(chalk.white(`   - Title: ${updatedAnswers.title}`));

    } catch (err) {
        console.error(chalk.red('An error occurred while editing the post:'), err);
    }
}