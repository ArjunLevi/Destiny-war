# Contract Deployment Information

## Deployed Contract Address

**Contract Address:** `0xfcaB4bd2DB11b8776Bda910973404DeD4ec7dADA`

**Network:** Base Mainnet (Chain ID: 8453)

**Block Explorer:** https://basescan.org/address/0xfcaB4bd2DB11b8776Bda910973404DeD4ec7dADA

## Configuration

Your contract is now configured in the application. To use it:

1. **For Development:** Create a `.env.local` file in the root directory:
   \`\`\`bash
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xfcaB4bd2DB11b8776Bda910973404DeD4ec7dADA
   \`\`\`

2. **For Production (Vercel):** Add the environment variable in your Vercel project settings:
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add: `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` = `0xfcaB4bd2DB11b8776Bda910973404DeD4ec7dADA`

3. **Restart your development server** to pick up the changes:
   \`\`\`bash
   npm run dev
   \`\`\`

## Contract Details

- **Owner:** 0x979bd79e0a2d074d652ca9e03ac99f04cbf84316
- **Mint Price:** 0.0001 ETH per character
- **Character Types:**
  - TEAM1 (0): Blaze & Spark
  - TEAM2 (1): Terra & Hunter
  - TEAM3 (2): Mystic & Oracle

## Testing the Contract

You can now mint characters at: https://destinywar.app/mint

Make sure you have:
- A wallet with ETH on Base mainnet
- At least 0.0001 ETH + gas fees

## Verify Contract on BaseScan (Optional)

If you haven't verified yet, run:
\`\`\`bash
npx hardhat verify --network base 0xfcaB4bd2DB11b8776Bda910973404DeD4ec7dADA
\`\`\`

This will make your contract source code public and verifiable on BaseScan.
