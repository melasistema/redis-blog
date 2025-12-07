#!/usr/bin/env tsx
import 'dotenv/config';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { printBanner } from '../cli/utils/cli-banner';
import { deletePostCLI } from './post/delete';
import { listPostsCLI } from './post/list';
import { createPostCLI } from './post/create';
import { editPostCLI } from './post/edit';
import { searchPostCLI } from './post/search';

async function mainMenu() {
    printBanner();

    console.log(chalk.bold.white('\nWelcome to the Redis Blog CLI!'));
    console.log(chalk.white('Manage your blog posts quickly and efficiently.'));
    console.log(chalk.gray('Available actions:'));
    console.log(chalk.gray('  - Create: Add a new blog post.'));
    console.log(chalk.gray('  - List: View all existing blog posts.'));
    console.log(chalk.gray('  - Delete: Remove a blog post.'));
    console.log(chalk.gray('  - Edit: Modify an existing blog post.'));
    console.log(chalk.gray('  - Search: Find specific blog posts.'));
    console.log(chalk.gray('  - Exit: Close the CLI.'));
    
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Select an action:',
            choices: [
                { name: 'Create new post', value: 'create' },
                { name: 'List all posts', value: 'list' },
                { name: 'Edit a post', value: 'edit' },
                { name: 'Delete a post', value: 'delete' },
                { name: 'Search posts', value: 'search' },
                new inquirer.Separator(),
                { name: 'Exit', value: 'exit' },
            ],
        },
    ]);

    switch (action) {
        case 'create':
            await createPostCLI();
            break;
        case 'list':
            await listPostsCLI();
            break;
        case 'edit':
            await editPostCLI();
            break;
        case 'delete':
            await deletePostCLI();
            break;
        case 'search':
            await searchPostCLI();
            break;
        case 'exit':
            console.log(chalk.green('Goodbye!'));
            process.exit(0);
    }
    await pauseAndReturnToMenu();
}

async function pauseAndReturnToMenu() {
    await inquirer.prompt([
        { type: 'input', name: 'continue', message: 'Press Enter to return to the main menu...' },
    ]);
    await mainMenu();
}

export async function cli() {
    await mainMenu();
}

// Run CLI directly if executed. This allows `tsx scripts/cli/index.ts` to work.
if (import.meta.url === `file://${process.argv[1]}`) {
    cli();
}
