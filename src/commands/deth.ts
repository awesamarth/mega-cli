import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';


export default function dethCommand(program: Command) {
    program
        .command('deth')
        .description('Unleash the power of Mega')
        .action(() => {
            try {
                // Display warning message in an eye-catching way
                console.log('\n');
                console.log(chalk.red.bold('██████╗ ███████╗████████╗██╗  ██╗    ██╗███╗   ███╗███╗   ███╗██╗███╗   ██╗███████╗███╗   ██╗████████╗'));
                console.log(chalk.red.bold('██╔══██╗██╔════╝╚══██╔══╝██║  ██║    ██║████╗ ████║████╗ ████║██║████╗  ██║██╔════╝████╗  ██║╚══██╔══╝'));
                console.log(chalk.red.bold('██║  ██║█████╗     ██║   ███████║    ██║██╔████╔██║██╔████╔██║██║██╔██╗ ██║█████╗  ██╔██╗ ██║   ██║   '));
                console.log(chalk.red.bold('██║  ██║██╔══╝     ██║   ██╔══██║    ██║██║╚██╔╝██║██║╚██╔╝██║██║██║╚██╗██║██╔══╝  ██║╚██╗██║   ██║   '));
                console.log(chalk.red.bold('██████╔╝███████╗   ██║   ██║  ██║    ██║██║ ╚═╝ ██║██║ ╚═╝ ██║██║██║ ╚████║███████╗██║ ╚████║   ██║   '));
                console.log(chalk.red.bold('╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝    ╚═╝╚═╝     ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═══╝   ╚═╝   '));
                console.log('\n');



                // Define a list of Megadeth songs and randomly select one
                const megadethSongs = [
                    'https://www.youtube.com/watch?v=9d4ui9q7eDM',
                    'https://www.youtube.com/watch?v=rdEupVsL07E',
                    'https://www.youtube.com/watch?v=vfpgpf6QVnI',
                    'https://www.youtube.com/watch?v=aOnKCcjP8Qs',
                    'https://www.youtube.com/watch?v=F8PDRO4aDSo'
                ];

                const randomSong = megadethSongs[Math.floor(Math.random() * megadethSongs.length)];

                // Open the YouTube link in the default browser
                const isWSL = fs.existsSync('/proc/version') &&
                    fs.readFileSync('/proc/version', 'utf-8').toLowerCase().includes('microsoft');

                // Use special handling for WSL
                if (isWSL) {
                    try {
                        // In WSL, use powershell.exe to open the URL in the Windows browser
                        execSync(`powershell.exe -Command "Start-Process '${randomSong}'"`, { stdio: 'ignore' });
                        console.log(chalk.green('Enjoy 🤘🤘'));
                    } catch (wslError) {
                        // Fallback if powershell approach fails
                        console.log(chalk.yellow('Could not open browser automatically in WSL.'));
                        console.log(chalk.cyan(`Here's your Megadeth link: ${randomSong}`));
                    }
                } else {
                    // Normal handling for non-WSL environments
                    const openCommand = process.platform === 'win32'
                        ? `start ${randomSong}`
                        : process.platform === 'darwin'
                            ? `open ${randomSong}`
                            : `xdg-open ${randomSong}`;

                    execSync(openCommand, { stdio: 'ignore' });
                    console.log(chalk.green('Enjoy 🤘🤘'));
                }

            } catch (error) {
                console.error(chalk.red('Failed to unleash the power of Megadeth.'));
                if (error instanceof Error) {
                    console.error(error.message);
                }

                // At minimum, print a link for the user
                console.log(chalk.cyan('Visit https://www.youtube.com/watch?v=vfpgpf6QVnI to experience Megadeth yourself.'));
            }
        });
}