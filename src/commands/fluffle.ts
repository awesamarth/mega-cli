import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';

export default function fluffleCommand(program: Command) {
    program
        .command('fluffle')
        .description('Explore the MegaETH ecosystem and have fun with Fluffles')
        .action(() => {
            try {
                console.log(chalk.blue('Opening Fluffle Tools in your browser...\n'));
                
                const fluffleToolsLink = "https://www.fluffle.tools";
                const twitterHandle = "ultra";
                const twitterLink = `https://twitter.com/0x_ultra`;

                // Open the Fluffle Tools link in the default browser
                const isWSL = fs.existsSync('/proc/version') &&
                    fs.readFileSync('/proc/version', 'utf-8').toLowerCase().includes('microsoft');

                // Create terminal hyperlink escape sequence for modern terminals
                // Format: \u001B]8;;URL\u0007TEXT\u001B]8;;\u0007
                const twitterHandleWithLink = `\u001B]8;;${twitterLink}\u0007${twitterHandle}\u001B]8;;\u0007`;
                
                // Use special handling for WSL
                if (isWSL) {
                    try {
                        // In WSL, use powershell.exe to open the URL in the Windows browser
                        execSync(`powershell.exe -Command "Start-Process '${fluffleToolsLink}'"`, { stdio: 'ignore' });
                        
                        // Display Thank you message with clickable link
                        console.log(chalk.green(`Thank you ${chalk.cyan(twitterHandleWithLink)}!\n`));
                    } catch (wslError) {
                        // Fallback if powershell approach fails
                        console.log(chalk.yellow('Could not open browser automatically in WSL.\n'));
                        console.log(chalk.cyan(`Here's your Fluffle Tools link: ${fluffleToolsLink}`));
                        console.log(chalk.green(`Thank you ${chalk.cyan(twitterHandleWithLink)}!\n`));
                    }
                } else {
                    // Normal handling for non-WSL environments
                    const openCommand = process.platform === 'win32'
                        ? `start ${fluffleToolsLink}`
                        : process.platform === 'darwin'
                            ? `open ${fluffleToolsLink}`
                            : `xdg-open ${fluffleToolsLink}`;

                    execSync(openCommand, { stdio: 'ignore' });
                    
                    console.log(chalk.green(`Thank you ${chalk.cyan(twitterHandleWithLink)}!\n`));
                }

            } catch (error) {
                console.error(chalk.red('Failed to open Fluffle Tools.\n'));
                if (error instanceof Error) {
                    console.error(error.message);
                }

                // At minimum, print a link for the user
                console.log(chalk.cyan('Visit https://www.fluffle.tools manually if your browser did not open.\n'));
            }
        });
}