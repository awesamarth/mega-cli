# Mega CLI

A complete development environment for the Mega blockchain. This CLI streamlines the development workflow for smart contract developers, frontend developers, and full-stack developers working with the Mega testnet.

[![NPM Version](https://img.shields.io/npm/v/megaeth-cli.svg)](https://www.npmjs.com/package/megaeth-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Project templating**: Create boilerplate projects for smart contract, frontend, or full-stack development
- **Development environment**: Easily start local blockchain or frontend development servers
- **Account management**: Create, import, and manage blockchain accounts
- **Smart contract operations**: Compile, deploy, and verify contracts on Mega testnet
- **Ethereum operations**: Check balances and request tokens from faucet
- **Foundry integration**: Seamless integration with Foundry tools (Anvil, Forge, Cast)

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
mega init [project-name]

# Create a frontend-only project (NextJS + WalletConnect)
mega init [project-name] --frontend

# Create a Foundry-only project configured for Mega testnet
mega init [project-name] --foundry
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
mega deploy <contract>

# Deploy to local network instead of testnet
mega deploy <contract> --local

# Verify a contract on block explorer
mega verify <address> <contract>
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
├── foundry/             # Smart contract development
│   ├── foundry.toml     # Foundry configuration
│   ├── src/             # Contract source files
│   └── test/            # Contract test files
├── next-app/            # Frontend application
│   ├── package.json
│   ├── pages/
│   └── public/
└── README.md
```

### Frontend-Only Project

```
my-mega-project/
├── package.json
├── pages/
├── public/
└── README.md
```

### Foundry-Only Project

```
my-mega-project/
├── foundry.toml
├── src/
├── test/
└── README.md
```

## Examples

### Deploying a Contract

```bash
# Compile your contract
mega compile

# Deploy to Mega testnet
mega deploy src/MyContract.sol

# Deploy with constructor arguments
mega deploy src/MyContract.sol --constructor-args "Mega Token" "MEGA" 1000000000000000000000000
```

### Creating and Using Accounts

```bash
# Create a new account
mega account create
# > Enter a name for your wallet: myaccount

# Use this account to deploy a contract
mega deploy src/MyContract.sol --account myaccount
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT