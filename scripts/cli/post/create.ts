// scripts/cli/post/new.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as readline from 'readline';
import { PostService } from '../utils/post-service';

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

        // Finally, return to Inquirer for the remaining metadata.
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
            author: author,
            tags: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        };

        await postService.connect();
        console.log(chalk.blue('\nSaving post to Redis...'));

        const newPost = await postService.createPost(postData);

        console.log(chalk.green('\n✅ Successfully created new post!'));
        console.log(chalk.white(`   - Title: ${newPost.title}`));
        console.log(chalk.white(`   - Author: ${newPost.author}`));
        console.log(chalk.white(`   - Slug: ${newPost.slug}`));
        console.log(chalk.white(`   - Tags: ${newPost.tags?.join(', ')}`));

    } catch (err) {
        console.error(chalk.red('An error occurred while creating the post:'), err);
    } finally {
        await postService.disconnect();
        console.log(chalk.gray('\nDisconnected from Redis.'));
    }
}