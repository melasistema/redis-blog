import figlet from 'figlet';
import chalk from 'chalk';

export function printBanner() {

    // Big "Redis Blog" logo with ANSI Shadow font
    const text = figlet.textSync("Redis Blog", {
        font: "ANSI Shadow",
        horizontalLayout: 'default',
        verticalLayout: 'default',
    });

    console.log(chalk.redBright(text));

    console.log(chalk.gray("──────────────────────────────────────────────"));
    console.log(chalk.redBright.bold("A minimalistic blog powered by Redis + Nuxt"));
    console.log(chalk.gray("──────────────────────────────────────────────\n"));

    // Optional footer with author and license
    console.log(chalk.gray(" Created by: Luca Visciola (https://github.com/melasistema)"));
    console.log(chalk.gray(" License: MIT\n"));
}
