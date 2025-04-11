import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

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
                // Check if Foundry is installed
                try {
                    execSync('cast --version', { stdio: 'ignore' });
                } catch (error) {
                    console.error(`${chalk.red('Error:')} Foundry is not installed.`);
                    console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
                    return;
                }

                // Faucet contract details
                const faucetContract = '0xaF5AA075cb327d83cB8D565D95202494569517a9';
                const faucetFunction = '0xb026ba57'; 
                const rpcUrl = 'https://carrot.megaeth.com/rpc';
                
                let privateKey = '';
                let userAddress = '';
                
                // Get private key and address based on options
                if (options.account) {
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
                            
                            privateKey = privateKeyMatch[0];
                            console.log(privateKey)
                            
                            userAddress = execSync(
                                `cast wallet address ${privateKey}`, 
                                { encoding: 'utf8' }
                            ).trim();

                           
                            
                            console.log(`${chalk.green('Using address:')} ${userAddress}`);
                        } catch (error) {
                            console.error(chalk.red('Failed to unlock account. Check your account name and password.'));
                            process.exit(1);
                        }

                } else if (options.privateKey) {
                    privateKey = options.privateKey;
                    
                    try {
                        // Get address from private key
                        userAddress = execSync(
                            `cast wallet address --private-key ${privateKey}`, 
                            { encoding: 'utf8' }
                        ).trim();
                        
                        console.log(`${chalk.green('Using address:')} ${userAddress}`);
                    } catch (error) {
                        console.error(chalk.red('Invalid private key format.'));
                        process.exit(1);
                    }
                }
            
                
                // First use cast call to check if the transaction would succeed
                console.log(chalk.blue('Checking eligibility for faucet claim...'));
                const callCommand = `cast call ${faucetContract} "${faucetFunction}" --rpc-url ${rpcUrl} --from ${userAddress}`;
                
                try {
                    execSync(callCommand, { encoding: 'utf8', stdio: 'pipe' });
                    
                    // If we get here, the call succeeded and we can proceed with the actual transaction
                    console.log(chalk.green('Address is eligible for faucet!'));
                } catch (error) {
                    // console.log("here is the error message: ", errorMessage)
                    const errorMsg = error instanceof Error ? error.message : String(error);                    
                    if (errorMsg.includes('execution reverted')) {
                        // Extract the error selector using regex
                        const dataMatch = errorMsg.match(/data: "([^"]+)"/);
                        const errorSelector = dataMatch ? dataMatch[1] : null;
                        
                        if (errorSelector === "0x7f12493d") {
                            console.error(chalk.red('You have already claimed from the faucet recently.'));
                            console.error(chalk.yellow('Please wait 24 hours between claims.'));
                        } else if (errorSelector === "0xc1336f85") {
                            console.error(chalk.red('The faucet is currently out of funds.'));
                            console.error(chalk.yellow('Please try again later when the faucet has been refilled.'));
                        } else if (errorSelector === "0x30cd7471") {
                            console.error(chalk.red('This function can only be called by the faucet owner.'));
                        } else {
                            console.error(chalk.red('You are not eligible to claim from the faucet.'));
                            console.error(chalk.yellow('Unknown reason:'), errorMsg);
                        }
                    } else {
                        console.error(chalk.red('Error checking eligibility:'));
                        console.error(errorMsg);
                    }
                    return;
                }
                
                // Now proceed with the actual transaction
                console.log(chalk.blue('Claiming 0.001 ETH from faucet...'));
                
                try {
                    const sendCommand = `cast send ${faucetContract} "${faucetFunction}" --rpc-url ${rpcUrl} --private-key ${privateKey} --gas-limit 100000 --json`;
                    const result = execSync(sendCommand, { encoding: 'utf8' });
                    const txData = JSON.parse(result);
                    
                    if (txData.status === '0x0') {
                        console.log(chalk.red('Error claiming from faucet'));
                        console.log(chalk.red('Transaction failed on-chain'));
                        console.log(chalk.red('Transaction hash:'), txData.transactionHash);
                        return;
                    }
                    
                    console.log(chalk.green('Faucet claim successful!'));
                    console.log(chalk.cyan('Transaction hash:'), txData.transactionHash);
                    
                    // Check new balance after claiming
                    console.log(chalk.blue('Waiting for transaction to be mined...'));
                    setTimeout(() => {
                        try {
                            const newBalance = execSync(
                                `cast balance ${userAddress} --rpc-url ${rpcUrl} -e`, 
                                { encoding: 'utf8' }
                            ).trim();
                            console.log(chalk.green(`New balance: ${newBalance} ETH`));
                        } catch (error) {
                            console.log(chalk.yellow('Unable to retrieve updated balance.'));
                        }
                    }, 20); // Giving more time for the transaction to be mined
                    
                } catch (error) {
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