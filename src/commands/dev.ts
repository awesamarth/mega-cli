import { Command } from 'commander';
import chalk from 'chalk';
import { execSync, spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export default function devCommand(program: Command) {
    program
        .command('dev')
        .description('Start development environment(s)')
        .option('--foundry', 'Start only the Foundry/Anvil local chain')
        .option('--frontend', 'Start only the Next.js frontend')
        .action(async (options) => {
            try {
                const currentDir = process.cwd();
                
                // Check current directory first
                let hasFoundry = fs.existsSync(path.join(currentDir, 'foundry.toml'));
                let hasNextJs = checkForNextJs(currentDir);

                // Paths to the subdirectories if found
                let foundryPath = hasFoundry ? currentDir : "";
                let nextJsPath = hasNextJs ? currentDir : "";

                // If not found in current directory, check one level of subdirectories
                if (!hasFoundry || !hasNextJs) {
                    // Get all directories in the current directory
                    const dirs = fs.readdirSync(currentDir, { withFileTypes: true })
                        .filter(dirent => dirent.isDirectory())
                        .map(dirent => dirent.name);
                    
                    // Look for foundry project in subdirectories
                    if (!hasFoundry) {
                        for (const dir of dirs) {
                            const potentialFoundryPath = path.join(currentDir, dir);
                            if (fs.existsSync(path.join(potentialFoundryPath, 'foundry.toml'))) {
                                hasFoundry = true;
                                foundryPath = potentialFoundryPath;
                                break;
                            }
                        }
                    }
                    
                    // Look for Next.js project in subdirectories
                    if (!hasNextJs) {
                        for (const dir of dirs) {
                            const potentialNextPath = path.join(currentDir, dir);
                            if (checkForNextJs(potentialNextPath)) {
                                hasNextJs = true;
                                nextJsPath = potentialNextPath;
                                break;
                            }
                        }
                    }
                }

                // If no flags specified and we can't detect either, show error
                if (!options.foundry && !options.frontend && !hasFoundry && !hasNextJs) {
                    console.error(chalk.red('Error: No Foundry or Next.js project detected in the current directory or subdirectories.'));
                    console.log(`Please run ${chalk.green('mega init')} to create a new project or specify ${chalk.green('--foundry')} or ${chalk.green('--frontend')} flags.`);
                    return;
                }

                // Determine what to start based on flags or detection
                let startFoundry = options.foundry || (!options.frontend && hasFoundry);
                let startFrontend = options.frontend || (!options.foundry && hasNextJs);

                // If no flags were specified, start both if both are detected
                if (!options.foundry && !options.frontend && hasFoundry && hasNextJs) {
                    startFoundry = true;
                    startFrontend = true;
                }

                let foundryProcess: ChildProcess | null = null;
                let nextProcess: ChildProcess | null = null;

                // Start Foundry/Anvil if needed
                if (startFoundry) {
                    // Check if Foundry is installed
                    try {
                        execSync('anvil --version', { stdio: 'ignore' });
                    } catch (error) {
                        console.error(`${chalk.red('Error:')} Foundry is not installed.`);
                        console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
                        return;
                    }

                    console.log(chalk.blue(`Starting Anvil local chain in ${chalk.yellow(foundryPath || 'current directory')}...`));

                    foundryProcess = spawn('anvil', ['--host', '0.0.0.0'], {
                        stdio: 'pipe',
                        shell: process.platform === 'win32', // Use shell on Windows
                        cwd: foundryPath || undefined // Use discovered path or default
                    });

                    // Handle output to extract and highlight important information
                    if (foundryProcess && foundryProcess.stdout) {
                        foundryProcess.stdout.on('data', (data) => {
                            const output = data.toString();
                            process.stdout.write(output);

                            // If this is the first output with private keys, highlight them
                            if (output.includes('Private Keys') && foundryProcess && !foundryProcess.privateKeysShown) {
                                console.log(chalk.yellow('\n=================================================='));
                                console.log(chalk.green('✓ Anvil running successfully!'));
                                console.log(chalk.cyan('You can use these accounts to deploy contracts with:'));
                                console.log(chalk.cyan('mega deploy <contract> --private-key <KEY>'));
                                console.log(chalk.yellow('==================================================\n'));

                                // Mark that we've shown the highlight so we don't repeat it
                                foundryProcess.privateKeysShown = true;
                            }
                        });
                    }

                    if (foundryProcess && foundryProcess.stderr) {
                        foundryProcess.stderr.on('data', (data) => {
                            process.stderr.write(data.toString());
                        });
                    }

                    if (foundryProcess) {
                        foundryProcess.on('error', (error) => {
                            console.error(`${chalk.red('Anvil error:')} ${error.message}`);
                        });

                        foundryProcess.on('close', (code) => {
                            if (code !== 0 && code !== null) {
                                console.error(`${chalk.red('Anvil exited with code:')} ${code}`);
                            }
                        });
                    }
                }

                // Start Next.js frontend if needed
                if (startFrontend) {
                    if (!hasNextJs) {
                        console.error(chalk.red('Error: No Next.js project detected in the current directory or subdirectories.'));
                        return;
                    }

                    console.log(chalk.blue(`Starting Next.js frontend in ${chalk.yellow(nextJsPath || 'current directory')}...`));

                    // Determine the right command (npm, yarn, pnpm)
                    const packageManager = determinePackageManager(nextJsPath);
                    const devCommand = `${packageManager} run dev`;

                    console.log(chalk.gray(`Running: ${devCommand}`));

                    nextProcess = spawn(devCommand, [], {
                        stdio: 'inherit',
                        shell: true, // Use shell to interpret the command
                        cwd: nextJsPath || undefined // Use discovered path or default
                    });

                    if (nextProcess) {
                        nextProcess.on('error', (error) => {
                            console.error(`${chalk.red('Next.js frontend error:')} ${error.message}`);
                        });
                    }
                }

                // Handle Ctrl+C to gracefully shut down both processes
                process.on('SIGINT', () => {
                    console.log(chalk.yellow('\nShutting down development environment...'));

                    if (foundryProcess) {
                        foundryProcess.kill('SIGINT');
                    }

                    if (nextProcess) {
                        nextProcess.kill('SIGINT');
                    }

                    process.exit(0);
                });

                // If both are running, let the user know

                if (startFoundry && startFrontend) {
                    console.log(chalk.green('\nBoth Anvil local chain and Next.js frontend are running.'));
                    console.log(chalk.yellow('For cleaner output, you can run them in separate terminals:'));
                    console.log(chalk.cyan('  Terminal 1: mega dev --foundry'));
                    console.log(chalk.cyan('  Terminal 2: mega dev --frontend'));
                    console.log(chalk.gray('Press Ctrl+C to stop both services.'));
                }


            } catch (error) {
                console.error(`\n${chalk.red('Error starting development environment:')}`);
                if (error instanceof Error) {
                    console.error(error.message);
                } else {
                    console.error(error);
                }
            }
        });
}

// Helper function to check if a Next.js project exists
function checkForNextJs(dir: string): boolean {
    try {
        // Check if package.json exists
        const packageJsonPath = path.join(dir, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            return false;
        }

        // Read and parse package.json
        const packageJson = fs.readJsonSync(packageJsonPath);

        // Check if it has Next.js dependency
        return !!(
            (packageJson.dependencies && packageJson.dependencies.next) ||
            (packageJson.devDependencies && packageJson.devDependencies.next)
        );
    } catch (error) {
        return false;
    }
}

// Helper function to determine which package manager to use
function determinePackageManager(dir: string): string {
    if (!dir) return 'npm';
    
    // Check for lockfiles to determine the package manager
    if (fs.existsSync(path.join(dir, 'yarn.lock'))) {
        return 'yarn';
    }
    if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) {
        return 'pnpm';
    }
    // Default to npm
    return 'npm';
}

// Add a custom property to ChildProcess
declare module 'child_process' {
    interface ChildProcess {
        privateKeysShown?: boolean;
    }
}