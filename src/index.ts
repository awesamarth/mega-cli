import { Command } from 'commander';
import chalk from 'chalk';
import setupCommand from './commands/setup';
import compileCommand from './commands/build';
import accountCommands from './commands/account';
import balanceCommand from './commands/balance';
import deployCommand from './commands/deploy';
import verifyCommand from './commands/verify';
import devCommand from './commands/dev';
import dethCommand from './commands/deth';
import initCommand from './commands/init';

const program = new Command();

// Set version and description
program
  .version('0.1.0')
  .description('A complete development environment for MegaETH');

setupCommand(program);
compileCommand(program)
accountCommands(program)
balanceCommand(program);
deployCommand(program);
// verifyCommand(program);
devCommand(program)
dethCommand(program)
initCommand(program)




// Default command when no arguments provided
program.action(() => {
  console.log(`
${chalk.blue('███╗   ███╗███████╗ ██████╗  █████╗      ██████╗██╗     ██╗')}
${chalk.blue('████╗ ████║██╔════╝██╔════╝ ██╔══██╗    ██╔════╝██║     ██║')}
${chalk.blue('██╔████╔██║█████╗  ██║  ███╗███████║    ██║     ██║     ██║')}
${chalk.blue('██║╚██╔╝██║██╔══╝  ██║   ██║██╔══██║    ██║     ██║     ██║')}
${chalk.blue('██║ ╚═╝ ██║███████╗╚██████╔╝██║  ██║    ╚██████╗███████╗██║')}
${chalk.blue('╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝     ╚═════╝╚══════╝╚═╝')}
                                                               ${chalk.gray(`v${require('../package.json').version}`)}
A complete development environment for MegaETH

${chalk.yellow('Available commands:')}

  ${chalk.green('account')}        Manage accounts and wallets
  ${chalk.green('balance')}        Check ETH balance for an address or account on MegaETH
  ${chalk.green('faucet')}         Request test tokens
  ${chalk.green('setup')}          Check and install dependencies
  ${chalk.green('init')}           Create a new Next.js/Foundry/full-stack project pre-configured for MegaETH 
  ${chalk.green('dev')}            Start development environments
  ${chalk.green('compile')}        Compile contracts
  ${chalk.green('deploy')}         Deploy contracts to Mega testnet

Run ${chalk.green('mega --help')} for detailed usage information.
`);
});

program.parse(process.argv);