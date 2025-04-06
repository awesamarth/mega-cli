import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';

export default function deployCommand(program: Command) {
  program
    .command('deploy <contract>')
    .alias('create')
    .description('Deploy a smart contract to local network or Mega testnet')
    .option('--testnet', 'Deploy to Mega testnet instead of local network')
    .option('--broadcast', 'Broadcast the transaction instead of doing a dry run')

    // Build Options
    .option('--constructor-args [args...]', 'The constructor arguments')
    .option('--constructor-args-path <file>', 'The path to a file containing the constructor arguments')
    .option('--verify', 'Verify contract after creation')
    .option('--verifier <name>', 'The verification provider (etherscan, sourcify, blockscout)')
    .option('--verifier-url <url>', 'The optional verifier url for submitting the verification request')
    .option('--unlocked', 'Send via eth_sendTransaction using the --from argument as sender')
    // Transaction Options
    .option('--gas-limit <limit>', 'Gas limit for the transaction')
    .option('--gas-price <price>', 'Gas price for the transaction')
    .option('--priority-gas-price <price>', 'Max priority fee per gas for EIP1559 transactions')
    .option('--value <value>', 'Ether to send in the transaction')
    .option('--nonce <nonce>', 'Nonce for the transaction')
    .option('--legacy', 'Send a legacy transaction instead of an EIP1559 transaction')
    // Wallet Options
    .option('-i, --interactive <num>', 'Open an interactive prompt to enter your private key')
    .option('--private-key <RAW_PRIVATE_KEY>', 'Use the provided private key')
    .option('--private-keys <RAW_PRIVATE_KEYS>', 'Use the provided private keys')
    .option('--keystore <path>', 'Use the keystore in the given folder or file')
    .option('--account <name>', 'Use a keystore account from the default keystores folder')
    .option('--password <password>', 'The keystore password')
    .option('-f, --from <address>', 'Sign the transaction with the specified account on the RPC')
    // Optimization Options
    .option('--optimize', 'Activate the Solidity optimizer')
    .option('--optimizer-runs <runs>', 'The number of optimizer runs')
    // Other common Forge options
    .option('--libraries <libraries>', 'Set pre-linked libraries')
    .option('-j, --json', 'Print the deployment information as JSON')
    .allowUnknownOption(true) // Allow passthrough of other forge create options
    .action(async (contract, options, command) => {
      try {
        // Check if Foundry is installed
        try {
          execSync('forge --version', { stdio: 'ignore' });
        } catch (error) {
          console.error(`${chalk.red('Error:')} Foundry is not installed.`);
          console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
          return;
        }

        // Set RPC URL based on --testnet flag (local is now default)
        const rpcUrl = options.testnet 
          ? 'https://carrot.megaeth.com/rpc'
          : 'http://localhost:8545';
        
        console.log(`${chalk.blue('Deploying to:')} ${options.testnet ? 'Mega Testnet' : 'Local Network'}`);
        console.log(`${chalk.gray('RPC URL:')} ${rpcUrl}`);
        console.log(`${chalk.blue('Contract:')} ${contract}`);

        if (!options.testnet) {  // If deploying to local network
          // Check if any wallet option is provided
          const hasWalletOption = options.privateKey || 
                                 options.privateKeys || 
                                 options.keystore || 
                                 options.account || 
                                 options.from || 
                                 options.interactive;
          
          // If no wallet option is provided, use the default Anvil private key
          if (!hasWalletOption) {
            options.privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
            console.log(`${chalk.gray('Using the first account provided by Anvil')}`);

          }

        }
        
        // Build forge create command
        let forgeCommand = `forge create ${contract} --rpc-url ${rpcUrl}`;
        
        // Add all options to the forge command
        if (options.constructorArgs) {
          // Constructor args must be at the end
          const constructorArgs = options.constructorArgs.join(' ');
          options.constructorArgs = undefined; // Remove from options to avoid adding twice
          forgeCommand += ` --constructor-args ${constructorArgs}`;
        }
        
        // Process other options
        Object.entries(options).forEach(([key, value]) => {
          // Skip the testnet flag as we've already handled it
          if (key === 'testnet') return;
          
          // Skip undefined values
          if (value === undefined) return;
          
          // Format the flag
          const flag = key.length === 1 ? `-${key}` : `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          
          // Add the flag to the command
          if (typeof value === 'boolean') {
            if (value) forgeCommand += ` ${flag}`;
          } else if (Array.isArray(value)) {
            forgeCommand += ` ${flag} ${value.join(' ')}`;
          } else {
            forgeCommand += ` ${flag} ${value}`;
          }
        });
        
        // Get any passthrough args
        const passthroughArgs = command.args.slice(1);
        if (passthroughArgs.length > 0) {
          forgeCommand += ` ${passthroughArgs.join(' ')}`;
        }
        
        // Execute the forge command
        execSync(forgeCommand, { stdio: 'inherit' });
        
      } catch (error) {
        // Forge will already show detailed errors, so we just handle the exception
        if (error instanceof Error && error.message) {
          console.error(`\n${chalk.red('Deployment failed. See above for details.')}`);
        }
        process.exit(1);
      }
    });
}