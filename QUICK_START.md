# Quick Start Guide - Deploy Your Destiny War NFT Contract

## Simple 3-Step Process

### Step 1: Run the Setup Script
\`\`\`bash
npm run setup
\`\`\`

This interactive script will:
- Check for your private key (or help you add it)
- Verify you have ETH on Base mainnet
- Optionally add your BaseScan API key
- Deploy the contract
- Save the contract address
- Verify the contract on BaseScan

### Step 2: Restart Your Dev Server
\`\`\`bash
npm run dev
\`\`\`

### Step 3: Test Minting
1. Visit your app at http://localhost:3000
2. Click "Connect Wallet"
3. Go to the Mint page
4. Select a character and mint for 0.0001 ETH

## That's it!

---

## What You Need Before Starting

1. **Private Key** - From your wallet (0x979bd79e0a2d074d652ca9e03ac99f04cbf84316)
   - In MetaMask: Settings → Security & Privacy → Reveal Private Key

2. **ETH on Base Mainnet** - For gas fees (~$1-2 worth)
   - Bridge at: https://bridge.base.org

3. **BaseScan API Key** (Optional) - For contract verification
   - Get it at: https://basescan.org/myapikey

## Manual Deployment (Alternative)

If you prefer manual setup:

1. Create `.env` file:
\`\`\`env
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_api_key_here
\`\`\`

2. Deploy:
\`\`\`bash
npm run deploy:base
\`\`\`

3. Add contract address to `.env`:
\`\`\`env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
\`\`\`

4. Verify (optional):
\`\`\`bash
npm run verify 0xYourContractAddress
\`\`\`

## Troubleshooting

**"Insufficient funds" error**
- Make sure you have ETH on Base mainnet, not Base Sepolia testnet

**"Invalid private key" error**
- Check your private key in .env (no 0x prefix needed)
- Make sure it's from wallet: 0x979bd79e0a2d074d652ca9e03ac99f04cbf84316

**Contract not working after deployment**
- Restart your dev server: `npm run dev`
- Check that NEXT_PUBLIC_NFT_CONTRACT_ADDRESS is in .env

## Need Help?

Check the full deployment guide in `DEPLOYMENT.md`
