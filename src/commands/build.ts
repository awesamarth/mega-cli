import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';

export default function compileCommand(program: Command) {
  program
    .command('compile')
    .alias('build')
    .description('Compile Solidity contracts using Foundry')
    // Build options
    .option('--names', 'Print compiled contract names')
    .option('--sizes', 'Print compiled non-test contract sizes')
    .option('--skip <dirs...>', 'Skip compilation of specific directories')
    // Cache options
    .option('--force', 'Clear the cache and recompile')
    // Linker options
    .option('--libraries <libs...>', 'Set pre-linked libraries')
    // Compiler options
    .option('--optimize', 'Activate the Solidity optimizer')
    .option('--optimizer-runs <runs>', 'The number of optimizer runs')
    .option('--via-ir', 'Use the Yul intermediate representation compilation pipeline')
    .option('--revert-strings <mode>', 'How to treat revert and require reason strings')
    .option('--use <version>', 'Specify the solc version to build with')
    .option('--offline', 'Do not access the network for missing solc versions')
    .option('--no-auto-detect', 'Do not auto-detect solc')
    .option('--ignored-error-codes <codes...>', 'Ignore solc warnings by error code')
    .option('--extra-output <selector...>', 'Extra output to include in artifacts')
    .option('--extra-output-files <selector...>', 'Extra output to write to separate files')
    .option('--evm-version <version>', 'The target EVM version')
    // Project options
    .option('--build-info', 'Generate build info files')
    .option('--build-info-path <path>', 'Output path for build info files')
    .option('--root <path>', 'The project\'s root path')
    .option('-C, --contracts <path>', 'The contracts source directory')
    .option('--lib-paths <paths...>', 'The path to the library folder')
    .option('-R, --remappings <remappings...>', 'The project\'s remappings')
    .option('--cache-path <path>', 'The path to the compiler cache')
    .option('--config-path <file>', 'Path to the config file')
    .option('--hh, --hardhat', 'Use Hardhat-style paths')
    .option('-o, --out <path>', 'The project\'s artifacts directory')
    .option('--silent', 'Suppress all output')
    // Watch options
    .option('-w, --watch [paths...]', 'Watch specific files or folders')
    .option('-d, --delay <delay>', 'File update debounce delay')
    .option('--no-restart', 'Do not restart the command while it\'s running')
    .option('--run-all', 'Explicitly re-run the command on all files when a change is made')
    .allowUnknownOption(true) // Pass through other options to forge
    .action(async (options, command) => {
      try {
        // Check if Foundry is installed
        try {
          execSync('forge --version', { stdio: 'ignore' });
        } catch (error) {
          console.error(`${chalk.red('Error:')} Foundry is not installed.`);
          console.log(`Run ${chalk.green('mega setup')} to install Foundry.`);
          return;
        }

        console.log(`${chalk.blue('Compiling contracts...')}`);
        
        // Build the forge compile command with all options
        let forgeCommand = 'forge build';

        // Process all options and map them to the forge command
        // Build options
        if (options.names) forgeCommand += ' --names';
        if (options.sizes) forgeCommand += ' --sizes';
        if (options.skip) forgeCommand += ` --skip ${options.skip.join(' ')}`;
        
        // Cache options
        if (options.force) forgeCommand += ' --force';
        
        // Linker options
        if (options.libraries) forgeCommand += ` --libraries ${options.libraries.join(',')}`;
        
        // Compiler options
        if (options.optimize) forgeCommand += ' --optimize';
        if (options.optimizerRuns) forgeCommand += ` --optimizer-runs ${options.optimizerRuns}`;
        if (options.viaIr) forgeCommand += ' --via-ir';
        if (options.revertStrings) forgeCommand += ` --revert-strings ${options.revertStrings}`;
        if (options.use) forgeCommand += ` --use ${options.use}`;
        if (options.offline) forgeCommand += ' --offline';
        if (options.noAutoDetect) forgeCommand += ' --no-auto-detect';
        if (options.ignoredErrorCodes) forgeCommand += ` --ignored-error-codes ${options.ignoredErrorCodes.join(',')}`;
        if (options.extraOutput) forgeCommand += ` --extra-output ${options.extraOutput.join(',')}`;
        if (options.extraOutputFiles) forgeCommand += ` --extra-output-files ${options.extraOutputFiles.join(',')}`;
        if (options.evmVersion) forgeCommand += ` --evm-version ${options.evmVersion}`;
        
        // Project options
        if (options.buildInfo) forgeCommand += ' --build-info';
        if (options.buildInfoPath) forgeCommand += ` --build-info-path ${options.buildInfoPath}`;
        if (options.root) forgeCommand += ` --root ${options.root}`;
        if (options.contracts) forgeCommand += ` --contracts ${options.contracts}`;
        if (options.libPaths) forgeCommand += ` --lib-paths ${options.libPaths.join(',')}`;
        if (options.remappings) forgeCommand += ` --remappings ${options.remappings.join(',')}`;
        if (options.cachePath) forgeCommand += ` --cache-path ${options.cachePath}`;
        if (options.configPath) forgeCommand += ` --config-path ${options.configPath}`;
        if (options.hardhat) forgeCommand += ' --hardhat';
        if (options.out) forgeCommand += ` --out ${options.out}`;
        if (options.silent) forgeCommand += ' --silent';
        
        // Watch options
        if (options.watch) {
          forgeCommand += ' --watch';
          if (options.watch.length > 0) {
            forgeCommand += ` ${options.watch.join(' ')}`;
          }
        }
        if (options.delay) forgeCommand += ` --delay ${options.delay}`;
        if (options.noRestart) forgeCommand += ' --no-restart';
        if (options.runAll) forgeCommand += ' --run-all';
        
        // Get any additional arguments passed to the command
        const passthrough = command.args.slice(1);
        if (passthrough.length > 0) {
          forgeCommand += ` ${passthrough.join(' ')}`;
        }
        
        // Execute the forge command
        execSync(forgeCommand, { stdio: 'inherit' });
        
        // Only show success message if not in watch mode (otherwise it would show after every compilation)
       
      } catch (error) {
        // Forge will already output error messages, so no need to duplicate
        if (!options.watch) {
          process.exit(1);
        }
      }
    });
}