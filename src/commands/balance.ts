import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import {megaethTestnet} from "viem/chains"
import { createPublicClient, formatEther, http } from 'viem';

const publicClient = createPublicClient({chain:megaethTestnet, transport:http()})

export default function balanceCommand(program: Command) {
  program
    .command('balance [address]')
    .description('Get the balance of an account or address in ETH on Mega testnet')
    .option('--account <name>', 'Use an account from the keystore')
    .option('-e, --ether', 'Show balance in ether instead of wei')
    .action(async (address, options) => {
      try {        
        const rpcUrl = 'https://carrot.megaeth.com/rpc';
        let targetAddress = address;
        let balance;
        let unit;

        // If using a keystore account
        if (options.account) {
          try {
            execSync('cast --version', { stdio: 'ignore' });
          } catch (error) {
            console.error(`${chalk.red('Error:')} Foundry is not installed.`);
            console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
            console.log(`If you don't want to install Foundry, specify the address directly like: ${chalk.green('mega balance <address>')}`);

            return;
          }

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
        console.log(`${chalk.gray('Network:')} MegaETH Testnet`);

        if (options.account){
          let balanceCommand = `cast balance ${targetAddress} --rpc-url ${rpcUrl}`;
          if (options.ether) {
            balanceCommand += ' -e';
          }
          balance = execSync(balanceCommand, { encoding: 'utf8' }).trim();
          unit = options.ether ? 'ETH' : 'wei';
          console.log(`${chalk.green('Balance:')} ${balance} ${unit}`);

          return
        }

        balance = await publicClient.getBalance({ 
          address: targetAddress,
        })
        if (options.ether){
          unit = 'ETH'
          balance=formatEther(balance)
        }
        else {
          unit = 'wei'
        }
        
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