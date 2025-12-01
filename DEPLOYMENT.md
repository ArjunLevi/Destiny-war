# Destiny War NFT Contract Deployment Guide

## Prerequisites

1. Node.js and npm installed
2. Private key of deployer wallet with ETH on Base mainnet
3. BaseScan API key (optional, for contract verification)

## Installation

Install Hardhat dependencies:

\`\`\`bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
\`\`\`

## Configuration

1. Create a `.env` file in the root directory:

\`\`\`env
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
\`\`\`

⚠️ **NEVER commit your .env file to Git!**

2. The contract owner is hardcoded as: `0x979bd79e0a2d074d652ca9e03ac99f04cbf84316`

## Deployment Steps

### 1. Compile the Contract

\`\`\`bash
npx hardhat compile
\`\`\`

### 2. Deploy to Base Mainnet

\`\`\`bash
npx hardhat run scripts/deploy.js --network base
\`\`\`

This will output:
- Contract address
- Owner address
- Mint price
- Max supply

### 3. Verify Contract on BaseScan

\`\`\`bash
npx hardhat verify --network base <CONTRACT_ADDRESS>
\`\`\`

### 4. Update Environment Variables

Add the deployed contract address to your `.env`:

\`\`\`env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=<deployed_contract_address>
\`\`\`

### 5. Update Frontend

The contract address will be automatically read from the environment variable in `lib/contracts/nft-mint.ts`.

## Contract Features

- **Mint Price**: 0.0001 ETH per character
- **Max Supply**: 10,000 characters
- **Character Types**: 3 teams (TEAM1, TEAM2, TEAM3)
- **Metadata**: Each character has level, wins, losses stats
- **Owner Functions**: Update stats, level up characters, withdraw funds

## Testing Locally (Optional)

Deploy to Base Sepolia testnet first for testing:

\`\`\`bash
npx hardhat run scripts/deploy.js --network base-sepolia
\`\`\`

Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## Contract Functions

### Public Functions
- `mintCharacter(characterType, tokenURI)` - Mint a new character (costs 0.0001 ETH)
- `getCharacter(tokenId)` - Get character details
- `getOwnedTokens(address)` - Get all tokens owned by an address
- `totalSupply()` - Get total minted characters

### Owner Functions
- `updateCharacterStats(tokenId, wins, losses)` - Update character battle stats
- `levelUpCharacter(tokenId)` - Increase character level
- `withdraw()` - Withdraw contract balance to owner

## Support

For issues or questions, refer to:
- Hardhat docs: https://hardhat.org/docs
- Base docs: https://docs.base.org
- OpenZeppelin docs: https://docs.openzeppelin.com
\`\`\`
