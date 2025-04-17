# Mega CLI

A sick CLI tool for MegaETH devs and users. This CLI streamlines the development workflow for smart contract developers, frontend developers, full-stack developers and users working with the Mega testnet.

![MEGA CLI interface showing available commands](https://raw.githubusercontent.com/awesamarth/mega-cli/refs/heads/main/assets/screenshot.png)

[![NPM Version](https://img.shields.io/npm/v/megaeth-cli.svg)](https://www.npmjs.com/package/megaeth-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Account management**: Create, import, and manage blockchain accounts
- **MegaETH operations**: Check balances and request tokens from faucet
- **Project templating**: Create boilerplate projects for smart contract, frontend, or full-stack development
- **Development environment**: Easily start local blockchain and/or frontend development servers
- **Smart contract operations**: Compile and deploy contracts on Mega testnet
- **Foundry**: Most Mega CLI commands are wrappers around Foundry (Anvil, Forge, Cast, Chisel) commands 

## Documentation

Full documentation available at [mega-cli.mintlify.app](https://mega-cli.mintlify.app)

## Video Walkthrough

Watch a complete demonstration of all Mega CLI commands and features:

[![Full Video Walkthrough](http://i.ytimg.com/vi/uLLzEAp9DL4/hqdefault.jpg)](https://www.youtube.com/watch?v=uLLzEAp9DL4)

## Installation

```bash
# Install globally using npm
npm install -g megaeth-cli

# Or using yarn
yarn global add megaeth-cli

# Or using pnpm
pnpm add -g megaeth-cli
```

### Setup

Mega CLI requires [Foundry](https://book.getfoundry.sh/) for most of its commands. You can install it by running:

```bash
# Check and set up dependencies
mega setup

# Check if dependencies are installed
mega setup --check
```

### Recommended: Set Up a Local Account
For the optimal experience with Mega CLI, it is recommended to set up a local account:

```bash
# Create a new account
mega account create
# > Name your account (e.g., "dev")
# > Enter a password

# Check your account was created successfully
mega account list
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

### Account Management

```bash
# Create a new account/wallet
mega account create

# Import an existing account
mega account import

# List all managed accounts
mega account list
```

### Balance Checking

```bash
# Check ETH balance for address (in wei)
mega balance [address]

# Check ETH balance for a stored account (in wei)
mega balance --account <name>

# Check ETH balance for address (in ether)
mega balance [address] --ether

# Check ETH balance for a stored account (in wei)
mega balance --account <name>
```


### Faucet

```bash
# Request test tokens from faucet
mega faucet --account <name>
# or
mega faucet --private-key <key>
```
 

### Spin up Boilerplate Templates

```bash
# Create a full-stack project (NextJS + Foundry)
mega init 
#or
mega init [project-name]

# Create a frontend-only project (NextJS + WalletConnect)
mega init --frontend

# Create a Foundry-only project. Almost identical to forge init.
mega init --foundry
```

### Development Environment

```bash
# Start both frontend and Foundry environments
mega dev

# Start just the NextJS app
mega dev --frontend

# Start just the Foundry local chain (Anvil)
mega dev --foundry
```



### Contract Development

```bash
# Compile Solidity contracts
mega compile

# Deploy to local network
mega deploy <path-to-contract>/<contract-file-name>.sol:<contract-name> --broadcast 


# Deploy a contract to MegaETH testnet
mega deploy <path-to-contract>/<contract-file-name>.sol:<contract-name> --broadcast --testnet --account <keystore-account-name>
# or, with private keys 
mega deploy <path-to-contract>/<contract-file-name>.sol:<contract-name> --broadcast --testnet --private-key <private-key>
```



### Explore

```bash
#Explore the MegaETH ecosystem (opens Fluffle Tools in browser)
mega fluffle
```

## Configuration

Mega CLI uses Foundry's existing configuration system. For Foundry-specific settings, refer to the [Foundry Book](https://book.getfoundry.sh/).

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
│       ├── config/         # Reown configuration
│       ├── constants/      # Constants
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
│   ├── config/             # Reown configuration
│   ├── constants/          # Constants
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

# Deploy to Mega testnet using a locally stored account named "dev"
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

### Getting Testnet Tokens

```bash
# Request test tokens using a saved account
mega faucet --account myaccount

# Or using a private key directly
mega faucet --private-key <your-private-key>
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
