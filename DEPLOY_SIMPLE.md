# Simple Deployment Guide

## Step 1: Delete node_modules and package-lock.json

\`\`\`bash
rm -rf node_modules package-lock.json
# On Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json
\`\`\`

## Step 2: Install dependencies

\`\`\`bash
npm install
\`\`\`

This should work without any errors now!

## Step 3: Make sure your .env file has your private key

\`\`\`env
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
\`\`\`

## Step 4: Deploy to Base Mainnet

\`\`\`bash
npm run deploy
\`\`\`

## Step 5: Copy the contract address

The deploy script will output the contract address. Copy it.

## Step 6: Add contract address to .env

\`\`\`env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
\`\`\`

## Done!

Your contract is deployed and your app is ready to mint NFTs!

## Verify on BaseScan (Optional)

\`\`\`bash
npm run verify <CONTRACT_ADDRESS>
