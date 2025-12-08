# Complete Deployment Guide - Destiny War NFT

## Prerequisites

Before deploying, ensure you have:

1. **Node.js and npm** installed
2. **ETH on Base mainnet** - You need ~0.01-0.02 ETH for deployment gas fees
3. **Private key** - From the wallet: 0x979bd79e0a2d074d652ca9e03ac99f04cbf84316
4. **BaseScan API key** (optional) - For contract verification

## Method 1: Automated Setup (Recommended)

Run the interactive setup script:

\`\`\`bash
npm run setup
\`\`\`

This script will:
- Check your environment variables
- Prompt for missing information
- Deploy the contract
- Automatically save the contract address
- Optionally verify on BaseScan

## Method 2: Manual Deployment

### Step 1: Configure Environment

Create or edit your `.env` file in the project root:

\`\`\`env
PRIVATE_KEY=your_private_key_without_0x_prefix
BASESCAN_API_KEY=your_basescan_api_key
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

### Step 3: Compile Contracts

\`\`\`bash
npx hardhat compile
\`\`\`

### Step 4: Deploy to Base Mainnet

\`\`\`bash
npm run deploy
\`\`\`

You should see output like:
\`\`\`
Deploying Destiny War NFT Contract to Base Mainnet...
✅ Contract deployed to: 0x1234567890abcdef1234567890abcdef12345678
✅ Contract address automatically saved to .env.local
\`\`\`

### Step 5: Restart Dev Server

The contract address is automatically saved. Just restart your Next.js server:

\`\`\`bash
# Press Ctrl+C to stop the current server
npm run dev
\`\`\`

### Step 6: Verify Contract (Optional)

\`\`\`bash
npx hardhat verify --network base YOUR_CONTRACT_ADDRESS
\`\`\`

## Verification

After deployment:

1. **Check BaseScan**: Visit https://basescan.org/address/YOUR_CONTRACT_ADDRESS
2. **Test Minting**: Go to your app's mint page and try minting a character
3. **Check Owner**: Verify the owner address is correct: 0x979bd79e0a2d074d652ca9e03ac99f04cbf84316

## Contract Details

- **Mint Price**: 0.0001 ETH per character
- **Max Supply**: 10,000 characters
- **Character Types**: 3 teams (Team1, Team2, Team3)
- **Network**: Base Mainnet (Chain ID: 8453)

## Troubleshooting

### "Contract not deployed" error

- Make sure `.env.local` has `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...`
- Restart your dev server after deployment

### Deployment fails

- Check you have enough ETH on Base mainnet
- Verify your private key is correct
- Try again with: `npm run deploy`

### Cannot find contract

- The deploy script automatically saves to `.env.local`
- Check the file exists in your project root
- Make sure the address starts with `0x`

### Hardhat dependency errors

- Run: `npm install --legacy-peer-deps`
- Delete `node_modules` and `package-lock.json`, then reinstall

## Post-Deployment

After successful deployment:

1. Share your contract address: https://basescan.org/address/YOUR_ADDRESS
2. Test all minting functionality
3. Share your app URL: https://destinywar.app
4. Monitor transactions on BaseScan

## Support

If you encounter issues:
1. Check BaseScan for transaction details
2. Review Hardhat error messages
3. Ensure your wallet has sufficient ETH
4. Verify you're on Base mainnet (Chain ID: 8453)
