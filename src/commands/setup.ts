import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

export default function setupCommand(program: Command) {
  program
    .command('setup')
    .description('Check and set up dependencies for Foundry (Anvil, Cast, Chisel and Forge)')
    .option('--check', 'Only check if dependencies are installed')
    .action(async (options) => {
      console.log(`${chalk.blue('Checking dependencies...')}`);
      
      // Check if Foundry is installed
      const foundryInstalled = checkFoundryInstalled();
      
      if (foundryInstalled) {
        console.log(`${chalk.green('✓')} Foundry is installed`);
      } else {
        console.log(`${chalk.red('✗')} Foundry not detected`);
        
        if (options.check) {
          console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
          return;
        }
        
        // If not check-only mode, offer to install Foundry
        if (process.platform === 'win32') {
          console.log(chalk.yellow('\nWindows detected. Foundry installation requires manual steps:'));
          console.log('\n1. Install Rust from https://rustup.rs/');
          console.log('\n2. Install Visual Studio from https://visualstudio.microsoft.com/downloads/ ')
          console.log('\n3. Open a new terminal and run:');
          console.log(chalk.cyan('cargo install --git https://github.com/foundry-rs/foundry --profile release --locked forge cast chisel anvil'));
          console.log('\nFor more details, visit: https://book.getfoundry.sh/getting-started/installation\n');
          
          const { checkLater } = await inquirer.prompt([{
            type: 'confirm',
            name: 'checkLater',
            message: 'Would you like to check again after installing manually?',
            default: true
          }]);
          
          if (checkLater) {
            console.log(`\nRun ${chalk.green('mega setup --check')} after completing the installation to verify.`);
          }
        } else {
          // Linux/macOS installation
          console.log(chalk.yellow('\nInstalling Foundry...'));
          
          try {
            // Run the foundryup script
            console.log('Downloading foundryup script...');
            execSync('curl -L https://foundry.paradigm.xyz | bash', { stdio: 'inherit' });
            
            console.log('\nRunning foundryup...');
            execSync('$HOME/.foundry/bin/foundryup', { stdio: 'inherit' });
            
            console.log(`\n${chalk.green('✓')} Foundry installed successfully!`);
            console.log(`\nTo ensure the 'forge' command is available in your terminal, you may need to:`);
            console.log(`1. Add this to your shell profile (.bashrc, .zshrc, etc.):`);
            console.log(chalk.cyan(`   export PATH="$PATH:$HOME/.foundry/bin"`));
            console.log(`2. Restart your terminal or run:`);
            console.log(chalk.cyan(`   source ~/.bashrc`));
            console.log(`   (or the appropriate file for your shell)`);
          } catch (error) {
            console.error(`\n${chalk.red('Error installing Foundry:')}`);
            console.error(error);
            console.log(`\nPlease try manual installation: https://book.getfoundry.sh/getting-started/installation`);
          }
        }
      }
    });
}

function checkFoundryInstalled(): boolean {
  try {
    // Try to run the forge --version command
    execSync('forge --version', { stdio: 'ignore' });
    execSync('anvil --version', { stdio: 'ignore' })
    execSync('cast --version', {stdio:'ignore'})
    execSync('chisel --version', {stdio:'ignore'})
    return true;
  } catch (error) {
    return false;
  }
}