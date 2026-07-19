import { Command, Option } from 'commander';
import chalk from 'chalk';
import { execFileSync, execSync } from 'child_process';
import { NETWORK_NAMES, resolveNetwork, validateCustomRpc } from '../networks';

export default function deployCommand(program: Command) {
  program
    .command('deploy <contract>')
    .alias('create')
    .description('Deploy a smart contract to local, MegaETH testnet, or MegaETH mainnet')
    .addOption(
      new Option('--network <network>', 'Target network')
        .choices([...NETWORK_NAMES])
        .default('local'),
    )
    .option('-r, --rpc-url <url>', 'Override the selected network RPC URL')
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
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .action(async (contract, options, command) => {
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
        await validateCustomRpc(network);
      } catch (error) {
        console.error(`${chalk.red('Network error:')} ${error instanceof Error ? error.message : String(error)}`);
        process.exitCode = 1;
        return;
      }

      console.log(`${chalk.blue('Deploying to:')} ${network.chain.name} (chain ${network.chain.id})`);
      console.log(`${chalk.gray('RPC URL:')} ${network.rpcUrl}`);
      console.log(`${chalk.blue('Contract:')} ${contract}`);

      if (network.name === 'local') {
        const hasWalletOption = options.privateKey ||
          options.privateKeys ||
          options.keystore ||
          options.account ||
          options.from ||
          options.interactive;

        if (!hasWalletOption) {
          options.privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
          console.log(chalk.gray('Using the first account provided by Anvil'));
        }
      }

      const constructorArgs = options.constructorArgs as string[] | undefined;
      const forgeArgs = ['create', contract, '--rpc-url', network.rpcUrl];

      for (const [key, value] of Object.entries(options)) {
        if (['network', 'rpcUrl', 'constructorArgs'].includes(key) || value === undefined) continue;

        const flag = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

        if (typeof value === 'boolean') {
          if (value) forgeArgs.push(flag);
        } else if (Array.isArray(value)) {
          forgeArgs.push(flag, ...value.map(String));
        } else {
          forgeArgs.push(flag, String(value));
        }
      }

      const passthroughArgs = command.args.slice(1);
      if (passthroughArgs.length > 0) forgeArgs.push(...passthroughArgs);

      if (constructorArgs?.length) {
        forgeArgs.push('--constructor-args', ...constructorArgs);
      }

      try {
        execFileSync('forge', forgeArgs, { stdio: 'inherit' });
      } catch {
        console.error(`\n${chalk.red('Deployment failed. See above for details.')}`);
        process.exit(1);
      }
    });
}
