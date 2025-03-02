import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';

export default function balanceCommand(program: Command) {
  program
    .command('balance [address]')
    .description('Get the balance of an account or address in ETH on Mega testnet')
    .option('--account <name>', 'Use an account from the keystore')
    .option('-e, --ether', 'Show balance in ether instead of wei')
    .action(async (address, options) => {
      try {
        // Check if Foundry is installed
        try {
          execSync('cast --version', { stdio: 'ignore' });
        } catch (error) {
          console.error(`${chalk.red('Error:')} Foundry is not installed.`);
          console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
          return;
        }

        // Hardcode the Sepolia RPC URL
        const rpcUrl = 'https://1rpc.io/sepolia';
        let targetAddress = address;

        // If using a keystore account
        if (options.account) {
          if (address) {
            console.warn(chalk.yellow('Warning: Address argument is ignored when --account is specified'));
          }
          
          console.log(`${chalk.blue('Getting address for account:')} ${options.account}`);
          
          try {
            // Get the address from the keystore account
            targetAddress = execSync(
              `cast wallet address --account ${options.account}`, 
              { encoding: 'utf8' }
            ).trim();
            
            console.log(`${chalk.green('Account address:')} ${targetAddress}`);
          } catch (error) {
            console.error(chalk.red('Failed to get address from keystore. Check your account name and password.'));
            process.exit(1);
          }
        }

        // Ensure we have an address to check balance for
        if (!targetAddress) {
          console.error(chalk.red('Error: No address provided. Use mega balance <address> or mega balance --account <name>'));
          process.exit(1);
        }

        console.log(`${chalk.blue('Checking balance for:')} ${targetAddress}`);
        console.log(`${chalk.gray('Network:')} Mega Testnet (Sepolia)`);
        
        // Construct the balance command
        let balanceCommand = `cast balance ${targetAddress} --rpc-url ${rpcUrl}`;
        
        // Add ether flag if specified
        if (options.ether) {
          balanceCommand += ' -e';
        }
        
        // Execute the balance command
        const balance = execSync(balanceCommand, { encoding: 'utf8' }).trim();
        
        // Display the result
        const unit = options.ether ? 'ETH' : 'wei';
        console.log(`${chalk.green('Balance:')} ${balance} ${unit}`);
        
      } catch (error) {
        console.error(`\n${chalk.red('Error checking balance:')}`);
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
      }
    });
}