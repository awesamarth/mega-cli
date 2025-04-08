import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';

export default function faucetCommand(program: Command) {
    program
        .command('faucet')
        .description('Request test tokens from the MegaETH testnet faucet')
        .option('--account <name>', 'Use a keystore account from the default keystores folder')
        .option('--private-key <key>', 'Use the provided private key')
        .action(async (options) => {
            if (!options.account && !options.privateKey) {
                console.log(chalk.blue('MegaETH Testnet Faucet'));
                console.log('\nYou need to provide authentication to claim from the faucet:');
                console.log(`  ${chalk.green('mega faucet --account <name>')}       Use a saved account`);
                console.log(`  ${chalk.yellow('or')}`);
                console.log(`  ${chalk.green('mega faucet --private-key <key>')}    Use a private key directly`);
                console.log('\nExample:');
                console.log(`  ${chalk.gray('mega faucet --account dev')}`);
                return;
            }
            try {
                // Check if Foundry is installed
                try {
                    execSync('cast --version', { stdio: 'ignore' });
                } catch (error) {
                    console.error(`${chalk.red('Error:')} Foundry is not installed.`);
                    console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
                    return;
                }

                if (!options.account && !options.privateKey) {
                    console.error(chalk.red('Error: You must provide either --account or --private-key'));
                    console.log(`Example: ${chalk.green('mega faucet --account my-account')} or ${chalk.green('mega faucet --private-key <key>')}`);
                    return;
                }

                const faucetContract = '0xaF5AA075cb327d83cB8D565D95202494569517a9';
                const faucetFunction = '0xb026ba57'; 
                const rpcUrl = 'https://carrot.megaeth.com/rpc';

                // Get the address for checking eligibility
                let addressForCheck: string = ''; // Initialize with empty string

                if (options.account) {
                    console.log(`${chalk.blue('Getting address for account:')} ${options.account}`);
                    try {
                        addressForCheck = execSync(
                            `cast wallet address --account ${options.account}`,
                            { encoding: 'utf8' }
                        ).trim();
                        console.log(`${chalk.green('Account address:')} ${addressForCheck}`);
                    } catch (error) {
                        console.error(chalk.red('Failed to get address from keystore. Check your account name and password.'));
                        process.exit(1);
                    }
                } else if (options.privateKey) {
                    // Get address from private key without displaying the key
                    try {
                        addressForCheck = execSync(
                            `cast wallet address --private-key ${options.privateKey}`,
                            { encoding: 'utf8' }
                        ).trim();
                        console.log(`${chalk.green('Account address:')} ${addressForCheck}`);
                    } catch (error) {
                        console.error(chalk.red('Invalid private key format.'));
                        process.exit(1);
                    }
                }

                // Ensure we have an address before proceeding
                if (!addressForCheck) {
                    console.error(chalk.red('Failed to determine address for faucet request.'));
                    return;
                }

                // First, check if we're eligible by reading the lastWithdrawalOfUser mapping
                console.log(chalk.blue('Checking if address is eligible for faucet...'));
                try {
                    // Get the last withdrawal timestamp
                    const lastWithdrawalCmd = `cast call ${faucetContract} "lastWithdrawalOfUser(address)(uint256)" ${addressForCheck} --rpc-url ${rpcUrl}`;
                    const lastWithdrawal = execSync(lastWithdrawalCmd, { encoding: 'utf8' }).trim();

                    // Convert to a number
                    const lastWithdrawalTime = parseInt(lastWithdrawal, 16);

                    // Check if 24 hours have passed
                    const currentTime = Math.floor(Date.now() / 1000);
                    if (lastWithdrawalTime > 0 && currentTime < lastWithdrawalTime + 24 * 60 * 60) {
                        // Calculate time remaining

                        console.error(chalk.yellow('You can only claim funds from the faucet once every 24 hours'));
                        console.error(chalk.yellow('Please try again later'));
                        return;
                    }

                    // Also check if the faucet has enough funds
                    const balanceCmd = `cast call ${faucetContract} "getBalanceOfFaucet()(uint256)" --rpc-url ${rpcUrl}`;
                    const faucetBalance = execSync(balanceCmd, { encoding: 'utf8' }).trim();

                    // The DRIP_AMOUNT is 0.001 ether (10^15 wei)
                    const minBalance = BigInt('1000000000000000');

                    if (BigInt(faucetBalance) < minBalance) {
                        console.error(chalk.yellow('The faucet is currently out of funds :('));
                        console.error(chalk.yellow('Please try again later'));
                        return;
                    }

                    console.log(chalk.green('Address is eligible for faucet claim!'));
                } catch (error) {
                    console.error(chalk.red('Error checking eligibility:'));
                    console.error(error instanceof Error ? error.message : String(error));
                    return;
                }
                console.log(chalk.blue('Claiming 0.001 ETH from faucet...'));

                let sendCommand = `cast send ${faucetContract} "${faucetFunction}" --rpc-url ${rpcUrl} --gas-limit 100000 --json`;

                if (options.privateKey) {
                    sendCommand += ` --private-key ${options.privateKey}`;
                } else if (options.account) {
                    sendCommand += ` --account ${options.account}`;
                }

                try {
                    const result = execSync(sendCommand, { encoding: 'utf8' });
                    const txData = JSON.parse(result);
                    console.log(chalk.green('Faucet claim successful!'));
                    console.log(chalk.cyan('Transaction hash:'), txData.transactionHash);

                    console.log(chalk.blue('Waiting for transaction to be mined...'));
                    setTimeout(() => {
                        try {
                            const balance = execSync(
                                `cast balance ${addressForCheck} --rpc-url ${rpcUrl} -e`,
                                { encoding: 'utf8' }
                            ).trim();
                            console.log(chalk.green(`New balance: ${balance} ETH`));
                        } catch (error) {
                            // Just skip balance check if it fails
                            console.log(chalk.yellow('Unable to retrieve updated balance.'));
                        }
                    }, 15);
                } catch (error: unknown) {
                    console.error(chalk.red('Error sending transaction:'));
                    console.error(error instanceof Error ? error.message : String(error));
                }

            } catch (error) {
                console.error(`\n${chalk.red('Error using faucet:')}`);
                if (error instanceof Error) {
                    console.error(error.message);
                } else {
                    console.error(error);
                }
            }
        });
}