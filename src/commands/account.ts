import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import inquirer from 'inquirer';


export default function accountCommands(program: Command) {
  const accountCommand = program
    .command('account')
    .description('Manage accounts and wallets');

  accountCommand
    .command('create')
    .description('Create a new account/wallet with custom name')
    .action(async () => {
      try {
        // Check if Foundry is installed
        try {
          execSync('cast --version', { stdio: 'ignore' });
        } catch (error) {
          console.error(`${chalk.red('Error:')} Foundry is not installed.`);
          console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
          return;
        }

        // Prompt for wallet name
        const { walletName } = await inquirer.prompt([{
          type: 'input',
          name: 'walletName',
          message: 'Enter a name for your new wallet:',
          validate: (input) => {
            if (!input.trim()) return 'Wallet name cannot be empty';
            if (/\s/.test(input)) return 'Wallet name cannot contain spaces';
            return true;
          }
        }]);

        console.log(chalk.blue(`Creating new wallet with name: ${walletName}...`));

        // 1. Generate a new wallet
        const result = execSync('cast wallet new', { encoding: 'utf8' });
        
        // Parse the output to extract the private key
        const privateKeyMatch = result.match(/Private key: (0x[a-fA-F0-9]{64})/);
        
        if (!privateKeyMatch) {
          throw new Error('Failed to extract private key from output');
        }
        
        const privateKey = privateKeyMatch[1];

        // 2. Import the wallet with the custom name
        console.log(chalk.yellow('Importing wallet to keystore...'));
        console.log(chalk.gray('You will be prompted to create a password to encrypt your wallet.'));
        
        // Use spawn to handle interactive password prompts properly
        const importCommand = `cast wallet import ${walletName} --private-key ${privateKey}`;
        execSync(importCommand, { stdio: 'inherit' });
        
        console.log(`\n${chalk.green('✓')} Wallet ${chalk.bold(walletName)} successfully created and imported!`);
        console.log(`\nYou can now use this wallet with ${chalk.cyan(`--account ${walletName}`)}`);
        
      } catch (error) {
        console.error(`\n${chalk.red('Error creating wallet:')}`);
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
      }
    });

    accountCommand
    .command('list')
    .description('List all managed accounts')
    .action(() => {
      try {
        // Check if Foundry is installed
        try {
          execSync('cast --version', { stdio: 'ignore' });
        } catch (error) {
          console.error(`${chalk.red('Error:')} Foundry is not installed.`);
          console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
          return;
        }
  
        console.log(chalk.blue('Listing available accounts in keystore:'));
        
        // Use the built-in cast wallet list command
        try {
          execSync('cast wallet list', { stdio: 'inherit' });
          console.log(`\nUse ${chalk.cyan('--account <NAME>')} with deploy commands to use these accounts.`);
        } catch (error) {
          // If no accounts are found, cast wallet list will exit with an error
          console.log(chalk.yellow('No accounts found in keystore.'));
          console.log(`Run ${chalk.green('mega account create')} to create your first account.`);
        }
        
      } catch (error) {
        console.error(`\n${chalk.red('Error listing accounts:')}`);
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
      }
    });
  // Import command
  accountCommand
    .command('import')
    .description('Import an existing private key with a custom name')
    .action(async () => {
      try {
        // Check if Foundry is installed
        try {
          execSync('cast --version', { stdio: 'ignore' });
        } catch (error) {
          console.error(`${chalk.red('Error:')} Foundry is not installed.`);
          console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
          return;
        }

        // Prompt for wallet name
        const { walletName } = await inquirer.prompt([{
          type: 'input',
          name: 'walletName',
          message: 'Enter a name for the wallet:',
          validate: (input) => {
            if (!input.trim()) return 'Wallet name cannot be empty';
            if (/\s/.test(input)) return 'Wallet name cannot contain spaces';
            return true;
          }
        }]);

        console.log(chalk.blue(`Importing wallet as: ${walletName}...`));
        console.log(chalk.yellow('You will be prompted to enter your private key and create a password.'));
        
        // Use interactive mode to securely input the private key
        execSync(`cast wallet import ${walletName} --interactive`, { stdio: 'inherit' });
        
        console.log(`\n${chalk.green('✓')} Wallet ${chalk.bold(walletName)} successfully imported!`);
        console.log(`\nYou can now use this wallet with ${chalk.cyan(`--account ${walletName}`)}`);
        
      } catch (error) {
        console.error(`\n${chalk.red('Error importing wallet:')}`);
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
      }
    });

  return accountCommand;
}