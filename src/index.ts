import { Command } from 'commander';
import chalk from 'chalk';
import setupCommand from './commands/setup';
import compileCommand from './commands/build';
import accountCommands from './commands/account';

const program = new Command();

// Set version and description
program
  .version('0.1.0')
  .description('A complete development environment for MegaETH');

setupCommand(program);
compileCommand(program)
accountCommands(program)


// Default command when no arguments provided
program.action(() => {
  console.log(`
${chalk.blue('Mega Blockchain CLI v0.1.0')}
A complete development environment for MegaETH

${chalk.yellow('Available commands:')}

  ${chalk.green('init')}           Create a new Next.js/Foundry/full-stack project pre-configured for MegaETH 
  ${chalk.green('dev')}            Start development environments
  ${chalk.green('account')}        Manage accounts and wallets
  ${chalk.green('faucet')}         Request test tokens
  ${chalk.green('compile')}        Compile Solidity contracts
  ${chalk.green('deploy')}         Deploy contracts to Mega testnet
  ${chalk.green('verify')}         Verify contracts on block explorer
  ${chalk.green('setup')}          Check and install dependencies

Run ${chalk.green('mega --help')} for detailed usage information.
`);
});

program.parse(process.argv);