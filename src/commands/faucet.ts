import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts';
import { BaseError, ContractFunctionRevertedError, createWalletClient, formatEther, http, publicActions } from 'viem';
import { megaethTestnet } from 'viem/chains';

const reducedAbi = [
    {
        "type": "function",
        "name": "requestFunds",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "error",
        "name": "CantWithdrawYet",
        "inputs": []
    },
    {
        "type": "error",
        "name": "FaucetEmpty",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NotOwner",
        "inputs": []
    }
];

export default function faucetCommand(program: Command) {
    program
        .command('faucet')
        .description('Request test tokens from the MegaETH testnet faucet')
        .option('--account <name>', 'Use a keystore account from the default keystores folder')
        .option('--private-key <key>', 'Use the provided private key directly')
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
                // Faucet contract details
                const faucetContract = '0xaF5AA075cb327d83cB8D565D95202494569517a9' as `0x${string}`;
                const rpcUrl = 'https://carrot.megaeth.com/rpc';
                
                let privateKey: `0x${string}`;
                let account: PrivateKeyAccount;
                
                // Get private key and address based on options
                if (options.account) {
                    try {
                        execSync('cast --version', { stdio: 'ignore' });
                    } catch (error) {
                        console.error(`${chalk.red('Error:')} Foundry is not installed.`);
                        console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
                        console.log(`If you don't want to install Foundry, use the private-key option instead like: ${chalk.green('mega faucet --private-key <your_private_key>')}`);

                        return;
                    }
                    
                    console.log(`${chalk.blue('Using account:')} ${options.account}`);
                    try {
                        // Use cast dk to get the private key
                        const output = execSync(
                            `cast wallet dk ${options.account}`, 
                            { encoding: 'utf8' }
                        ).trim();
                        const privateKeyMatch = output.match(/0x[a-fA-F0-9]{64}/);

                        if (!privateKeyMatch) {
                            console.error(chalk.red('Failed to extract private key from output'));
                            process.exit(1);
                        }
                        
                        privateKey = privateKeyMatch[0] as `0x${string}`;
                        account = privateKeyToAccount(privateKey);
                        console.log(`${chalk.green('Using address:')} ${account.address}`);
                    } catch (error) {
                        console.error(chalk.red('Failed to unlock account. Check your account name and password.'));
                        process.exit(1);
                    }
                } else if (options.privateKey) {
                    try {
                        privateKey = options.privateKey as `0x${string}`;
                        account = privateKeyToAccount(privateKey);
                        console.log(`${chalk.green('Using address:')} ${account.address}`);
                    } catch (error) {
                        console.error(chalk.red('Invalid private key format.'));
                        process.exit(1);
                    }
                } else {
                    console.error(chalk.red('No authentication method provided.'));
                    return;
                }

                // Create wallet client with the account and extend with public actions
                const walletClient = createWalletClient({
                    chain: megaethTestnet,
                    transport: http(rpcUrl),
                    account
                }).extend(publicActions);

                console.log(chalk.blue('Checking eligibility for faucet claim...'));
                
                try {
                    // Simulate the contract call to check eligibility
                    await walletClient.simulateContract({
                        address: faucetContract,
                        abi: reducedAbi,
                        functionName: 'requestFunds',
                        account,
                    });
                    
                    console.log(chalk.green('Address is eligible for faucet!'));
                    
                    // If simulation is successful, send the actual transaction
                    console.log(chalk.blue('Claiming 0.001 ETH from faucet...'));
                    
                    const hash = await walletClient.writeContract({
                        address: faucetContract,
                        abi: reducedAbi,
                        functionName: 'requestFunds',
                        account,
                    });
                    
                    console.log(chalk.green('Faucet claim successful!'));
                    console.log(chalk.cyan('Transaction hash:'), hash);
                    
                    // Wait for transaction to be mined
                    console.log(chalk.blue('Waiting for transaction to be mined...'));
                    await walletClient.waitForTransactionReceipt({ hash });
                    
                    // Get updated balance
                    const balance = await walletClient.getBalance({ address: account.address });
                    const balanceInEth = formatEther(balance);
                    console.log(chalk.green(`New balance: ${balanceInEth} ETH`));
                    
                } catch (err) {
                    if (err instanceof BaseError) {
                        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError);
                        
                        
                        if (revertError instanceof ContractFunctionRevertedError) {
                            const errorName = revertError.data?.errorName ?? '';
                            
                            if (errorName === 'CantWithdrawYet') {
                                console.error(chalk.red('You have already claimed from the faucet recently.'));
                                console.error(chalk.yellow('Please wait 24 hours between claims.'));
                            } else if (errorName === 'FaucetEmpty') {
                                console.error(chalk.red('The faucet is currently out of funds.'));
                                console.error(chalk.yellow('Please try again later when the faucet has been refilled.'));
                            } else if (errorName === 'NotOwner') {
                                console.error(chalk.red('This function can only be called by the faucet owner.'));
                            } else {
                                console.error(chalk.red('You are not eligible to claim from the faucet.'));
                                console.error(chalk.yellow('Unknown reason:'), errorName);
                            }
                        } else {
                            console.error(chalk.red('Error checking eligibility:'), err.shortMessage || err.message);
                        }
                    } else {
                        console.error(chalk.red('Error checking eligibility:'));
                        console.error(err instanceof Error ? err.message : String(err));
                    }
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