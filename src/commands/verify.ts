import { Command, Option } from 'commander';
import chalk from 'chalk';
import { execFileSync, execSync } from 'child_process';
import { NETWORK_NAMES, resolveNetwork, validateCustomRpc } from '../networks';

export default function verifyCommand(program: Command) {
  program
    .command('verify <address> <contract>')
    .description('Verify a smart contract on MegaETH testnet or mainnet')
    .addOption(
      new Option('--network <network>', 'Target network')
        .choices([...NETWORK_NAMES])
        .default('local'),
    )
    .option('-r, --rpc-url <url>', 'Override the selected network RPC URL')
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
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .action(async (address, contract, options, command) => {
      try {
        execSync('forge --version', { stdio: 'ignore' });
      } catch {
        console.error(`${chalk.red('Error:')} Foundry is not installed.`);
        console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
        return;
      }

      let network;
      try {
        network = resolveNetwork(options.network, options.rpcUrl);
        if (network.name === 'local') {
          throw new Error('Local contracts cannot be explorer-verified. Use --network testnet or --network mainnet.');
        }
        await validateCustomRpc(network);
      } catch (error) {
        console.error(`${chalk.red('Network error:')} ${error instanceof Error ? error.message : String(error)}`);
        process.exitCode = 1;
        return;
      }

      console.log(`${chalk.blue('Verifying contract on:')} ${network.chain.name} (chain ${network.chain.id})`);
      console.log(`${chalk.gray('Contract address:')} ${address}`);
      console.log(`${chalk.gray('Contract:')} ${contract}`);

      const forgeArgs = [
        'verify-contract',
        address,
        contract,
        '--chain',
        String(network.chain.id),
        '--rpc-url',
        network.rpcUrl,
      ];

      for (const [key, value] of Object.entries(options)) {
        if (['network', 'rpcUrl'].includes(key) || value === undefined) continue;

        const flag = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

        if (typeof value === 'boolean') {
          if (value) forgeArgs.push(flag);
        } else if (Array.isArray(value)) {
          forgeArgs.push(flag, ...value.map(String));
        } else {
          forgeArgs.push(flag, String(value));
        }
      }

      const passthroughArgs = command.args.slice(2);
      if (passthroughArgs.length > 0) forgeArgs.push(...passthroughArgs);

      try {
        execFileSync('forge', forgeArgs, { stdio: 'inherit' });
        console.log(`${chalk.green('✓')} Verification process completed!`);
      } catch {
        console.error(`\n${chalk.red('Verification failed. See above for details.')}`);
        process.exit(1);
      }
    });
}
