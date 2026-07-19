import { Command, Option } from 'commander';
import chalk from 'chalk';
import { execFileSync, execSync } from 'child_process';
import { createPublicClient, formatEther, http } from 'viem';
import { NETWORK_NAMES, resolveNetwork, validateCustomRpc } from '../networks';

export default function balanceCommand(program: Command) {
  program
    .command('balance [address]')
    .description('Get the ETH balance of an account or address on the selected network')
    .addOption(
      new Option('--network <network>', 'Target network')
        .choices([...NETWORK_NAMES])
        .default('local'),
    )
    .option('-r, --rpc-url <url>', 'Override the selected network RPC URL')
    .option('--account <name>', 'Use an account from the keystore')
    .option('-e, --ether', 'Show balance in ether instead of wei')
    .action(async (address, options) => {
      try {
        const network = resolveNetwork(options.network, options.rpcUrl);
        await validateCustomRpc(network);
        let targetAddress = address;

        if (options.account) {
          try {
            execSync('cast --version', { stdio: 'ignore' });
          } catch {
            console.error(`${chalk.red('Error:')} Foundry is not installed.`);
            console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
            console.log(`Alternatively, specify an address directly: ${chalk.green('mega balance <address>')}`);
            return;
          }

          if (address) {
            console.warn(chalk.yellow('Warning: Address argument is ignored when --account is specified'));
          }

          console.log(`${chalk.blue('Getting address for account:')} ${options.account}`);

          try {
            targetAddress = execFileSync(
              'cast',
              ['wallet', 'address', '--account', options.account],
              { encoding: 'utf8' },
            ).trim();
            console.log(`${chalk.green('Account address:')} ${targetAddress}`);
          } catch {
            console.error(chalk.red('Failed to get address from keystore. Check your account name and password.'));
            process.exit(1);
          }
        }

        if (!targetAddress) {
          console.error(chalk.red('Error: No address provided. Use mega balance <address> or mega balance --account <name>'));
          process.exit(1);
        }

        console.log(`${chalk.blue('Checking balance for:')} ${targetAddress}`);
        console.log(`${chalk.gray('Network:')} ${network.chain.name} (chain ${network.chain.id})`);

        const publicClient = createPublicClient({
          chain: network.chain,
          transport: http(network.rpcUrl),
        });
        let balance: bigint | string = await publicClient.getBalance({ address: targetAddress });
        const unit = options.ether ? 'ETH' : 'wei';

        if (options.ether) balance = formatEther(balance);

        console.log(`${chalk.green('Balance:')} ${balance} ${unit}`);
      } catch (error) {
        console.error(`\n${chalk.red('Error checking balance:')}`);
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      }
    });
}
