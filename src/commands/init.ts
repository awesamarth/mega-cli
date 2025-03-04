// src/commands/init.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

export default function initCommand(program: Command) {
  program
    .command('init [project-name]')
    .description('Create a new Mega project')
    .option('--frontend', 'Create a frontend-only project (NextJS + WalletConnect)')
    .option('--foundry', 'Create a Foundry-only project configured for Mega testnet')
    .action(async (projectName, options) => {
      try {
        // Determine project type and repository URL
        let repoUrl = 'https://github.com/awesamarth/mega-starter-full';
        let projectType = 'fullstack';
        
        if (options.frontend) {
          repoUrl = 'https://github.com/awesamarth/mega-starter-frontend';
          projectType = 'frontend';
        } else if (options.foundry) {
          repoUrl = 'https://github.com/awesamarth/mega-starter-foundry';
          projectType = 'foundry';
        }
        
        // If no project name provided, prompt for one
        if (!projectName) {
          const answers = await inquirer.prompt([{
            type: 'input',
            name: 'name',
            message: 'Enter a name for your project:',
            default: `mega-${projectType}-app`,
            validate: (input) => {
              if (!input.trim()) return 'Project name cannot be empty';
              if (fs.existsSync(input)) return 'Directory already exists';
              return true;
            }
          }]);
          projectName = answers.name;
        }
        
        // Check if the directory already exists
        if (fs.existsSync(projectName)) {
          console.error(chalk.red(`Error: Directory '${projectName}' already exists.`));
          process.exit(1);
        }
        
        console.log(chalk.blue(`Creating a new ${projectType} project in ${chalk.yellow(projectName)}...`));
        
        // Clone the repository
        console.log(chalk.gray(`Cloning from ${repoUrl}...`));
        execSync(`git clone ${repoUrl} ${projectName}`, { stdio: 'inherit' });
        
        // Remove .git directory to start fresh
        const gitDir = path.join(process.cwd(), projectName, '.git');
        if (fs.existsSync(gitDir)) {
          fs.removeSync(gitDir);
        }
        
        // Initialize a new git repository
        console.log(chalk.gray('Initializing a new git repository...'));
        execSync(`cd ${projectName} && git init`, { stdio: 'ignore' });
        
        // Install dependencies based on project type
        console.log(chalk.blue('Installing dependencies...'));
        
        if (projectType === 'fullstack' || projectType === 'frontend') {
          // Determine the frontend directory path
          const frontendDir = projectType === 'fullstack' ? 'next-app' : '.';
          const fullFrontendPath = path.join(process.cwd(), projectName, frontendDir);
          
          // Detect package manager from the correct directory
          let packageManager = 'npm';
          if (fs.existsSync(path.join(fullFrontendPath, 'yarn.lock'))) {
            packageManager = 'yarn';
          } else if (fs.existsSync(path.join(fullFrontendPath, 'pnpm-lock.yaml'))) {
            packageManager = 'pnpm';
          }
          
          try {
            console.log(chalk.gray(`Installing frontend dependencies with ${packageManager}...`));
            execSync(`cd ${path.join(projectName, frontendDir)} && ${packageManager} install`, { 
              stdio: 'inherit'
            });
          } catch (error) {
            console.warn(chalk.yellow(`\nWarning: Frontend dependency installation failed. You'll need to install them manually.`));
          }
        }
        
        // Success message and next steps
        console.log(`\n${chalk.green('✓')} Project created successfully!`);
        console.log('\nNext steps:');
        console.log(`  ${chalk.cyan('cd')} ${projectName}`);
        
        if (projectType === 'fullstack') {
          console.log(`  ${chalk.cyan('mega dev')} to start both frontend and foundry environments`);
        } else if (projectType === 'frontend') {
          console.log(`  ${chalk.cyan('mega dev --frontend')} to start the Next.js development server`);
        } else if (projectType === 'foundry') {
          console.log(`  ${chalk.cyan('mega dev --foundry')} to start the Anvil local chain`);
        }
        
      } catch (error) {
        console.error(`\n${chalk.red('Error initializing project:')}`);
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
        process.exit(1);
      }
    });
}