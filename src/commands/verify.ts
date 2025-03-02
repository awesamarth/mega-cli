import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';

export default function verifyCommand(program: Command) {
  program
    .command('verify <address> <contract>')
    .description('Verify a smart contract on Mega testnet (Sepolia)')
    // Verify Contract Options
    .option('--verifier <name>', 'The verification provider (etherscan, sourcify, blockscout)', 'etherscan')
    .option('--verifier-url <url>', 'The optional verifier url for submitting the verification request')
    .option('--skip-is-verified-check', 'Send the verification request even if the contract is already verified')
    .option('--compiler-version <version>', 'The compiler version used to build the smart contract')
    .option('--num-of-optimizations <num>', 'The number of optimization runs used to build the smart contract')
    .option('--optimizer-runs <num>', 'The number of optimization runs used to build the smart contract')
    .option('--constructor-args <args>', 'The ABI-encoded constructor arguments')
    .option('--constructor-args-path <file>', 'The path to a file containing the constructor arguments')
    .option('--flatten', 'Flag indicating whether to flatten the source code before verifying')
    .option('-f, --force', 'Do not compile the flattened smart contract before verifying')
    .option('--delay <delay>', 'Optional timeout to apply in between attempts in seconds')
    .option('--retries <retries>', 'Number of attempts for retrying')
    .option('--show-standard-json-input', 'Command outputs JSON suitable for saving to a file and uploading to block explorers')
    .option('--watch', 'Wait for verification result after submission')
    .option('--via-ir', 'Set viaIR to true')
    .option('--etherscan-api-key <key>', 'Your Etherscan API key')
    // Project Options
    .option('--build-info', 'Generate build info files')
    .option('--build-info-path <path>', 'Output path to directory that build info files will be written to')
    .option('--root <path>', 'The project\'s root path')
    .option('-C, --contracts <path>', 'The contracts source directory')
    .option('--lib-paths <path>', 'The path to the library folder')
    .option('-R, --remappings <remappings>', 'The project\'s remappings')
    .option('--cache-path <path>', 'The path to the compiler cache')
    .option('--config-path <file>', 'Path to the config file')
    .option('--hh, --hardhat', 'Use Hardhat-style paths')
    .allowUnknownOption(true) // Pass through other options to forge
    .action(async (address, contract, options, command) => {
      try {
        // Check if Foundry is installed
        try {
          execSync('forge --version', { stdio: 'ignore' });
        } catch (error) {
          console.error(`${chalk.red('Error:')} Foundry is not installed.`);
          console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
          return;
        }

        console.log(`${chalk.blue('Verifying contract on Mega testnet (Sepolia)...')}`);
        console.log(`${chalk.gray('Contract address:')} ${address}`);
        console.log(`${chalk.gray('Contract:')} ${contract}`);
        
        // Build forge verify-contract command
        let forgeCommand = `forge verify-contract ${address} ${contract} --chain 11155111`;
        
        // Process all options and map them to the forge command
        Object.entries(options).forEach(([key, value]) => {
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
        const passthroughArgs = command.args.slice(2); // Skip address and contract
        if (passthroughArgs.length > 0) {
          forgeCommand += ` ${passthroughArgs.join(' ')}`;
        }
        
        
        // Execute the forge command
        execSync(forgeCommand, { stdio: 'inherit' });
        
        console.log(`${chalk.green('✓')} Verification process completed!`);
        
      } catch (error) {
        // Forge will already show detailed errors, so we just handle the exception
        if (error instanceof Error && error.message) {
          console.error(`\n${chalk.red('Verification failed. See above for details.')}`);
        }
        process.exit(1);
      }
    });
}