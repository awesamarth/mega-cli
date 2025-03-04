# Mega CLI

A complete development environment for the Mega blockchain. This CLI streamlines the development workflow for smart contract developers, frontend developers, and full-stack developers working with the Mega testnet.

[![NPM Version](https://img.shields.io/npm/v/megaeth-cli.svg)](https://www.npmjs.com/package/megaeth-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Project templating**: Create boilerplate projects for smart contract, frontend, or full-stack development
- **Development environment**: Easily start local blockchain or frontend development servers
- **Account management**: Create, import, and manage blockchain accounts
- **Smart contract operations**: Compile, deploy, and verify contracts on Mega testnet
- **MegaETH operations**: Check balances and request tokens from faucet
- **Foundry integration**: Seamless integration with Foundry tools (Anvil, Forge, Cast, Chisel)

## Installation

```bash
# Install globally using npm
npm install -g megaeth-cli

# Or using yarn
yarn global add megaeth-cli

# Or using pnpm
pnpm add -g megaeth-cli
```

### Dependencies

Mega CLI requires [Foundry](https://book.getfoundry.sh/) for smart contract development functionality. You can install it by running:

```bash
mega setup
```

## Quick Start

```bash
# Create a new full-stack project
mega init my-mega-project

# Start the development environment
cd my-mega-project
mega dev
```

## Command Reference

### Project Creation

```bash
# Create a full-stack project (NextJS + Foundry)
mega init 
#or
mega init [project-name]

# Create a frontend-only project (NextJS + WalletConnect)
mega init --frontend

# Create a Foundry-only project configured for Mega testnet
mega init --foundry
```

### Development Environment

```bash
# Start both frontend and Foundry environments
mega dev

# Start just the NextJS app
mega dev --frontend

# Start just the Foundry/Anvil local chain
mega dev --foundry
```

### Account Management

```bash
# Create a new account/wallet
mega account create

# Import an existing account
mega account import

# List all managed accounts
mega account list

# Check ETH balance for address
mega balance [address]

# Check ETH balance for a stored account
mega balance --account <name>
```

### Contract Development

```bash
# Compile Solidity contracts
mega compile

# Deploy a contract
mega deploy <path-to-contract>/<contract-file-name>.sol:<contract-name> --broadcast --testnet --account <keystore-account-name>
#or, with private keys
mega deploy <path-to-contract>/<contract-file-name>.sol:<contract-name> --broadcast --testnet --private-key <private-key>



# Deploy to local network instead of testnet
mega deploy <path-to-contract>/<contract-file-name>.sol:<contract-name> --broadcast 

# Verify a contract on block explorer
mega verify  <contract address> --watch --etherscan-api-key <your-etherscan-api-key> <path-to-contract>/<contract-file-name>.sol:<contract-name>
```

### Network Operations (WIP)

```bash
# Request test tokens from faucet
mega faucet <address>
```

### Utility Commands

```bash
# Check and set up dependencies
mega setup

# Check if dependencies are installed
mega setup --check
```

## Configuration

Mega CLI leverages Foundry's existing configuration system. For Foundry-specific settings, refer to the [Foundry Book](https://book.getfoundry.sh/).

## Project Structure

When you create a new project with `mega init`, it will generate a project with the following structure:

### Full-Stack Project

```
my-mega-project/
├── foundry-app/            # Smart contract development
│   ├── lib/                # Dependencies including forge-std
│   ├── script/             # Deployment scripts
│   ├── src/                # Contract source files
│   ├── test/               # Contract test files
│   └── foundry.toml        # Foundry configuration
├── next-app/               # Frontend application
│   ├── public/             # Static assets
│   └── src/
│       ├── app/            # Next.js app router
│       │   └── gmega/      # Demo application routes
│       ├── components/     # Reusable components
│       ├── config/         # Application configuration
│       ├── constants/      # Constants and types
│       └── context/        # React context providers
└── README.md
```

### Frontend-Only Project

```
my-mega-project/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js app router
│   │   └── gmega/          # Demo application routes
│   ├── components/         # Reusable components
│   ├── config/             # Application configuration
│   ├── constants/          # Constants and types
│   └── context/            # React context providers
└── package.json
```

### Foundry-Only Project

```
my-mega-project/
├── lib/                    # Dependencies including forge-std
├── script/                 # Deployment scripts
├── src/                    # Contract source files
├── test/                   # Contract test files
└── foundry.toml            # Foundry configuration
```

## Examples

### Deploying a Contract

```bash
# Compile your contracts
mega compile

# Deploy to Mega testnet
mega deploy foundry-app/src/GmegaCounter.sol:GmegaCounter --broadcast --testnet --account dev


```

### Creating and Using Accounts

```bash
# Create a new account
mega account create
# > Enter a name for your wallet: myaccount

# Use this account to deploy a contract
mega deploy foundry-app/src/GmegaCounter.sol:GmegaCounter --broadcast
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT