# How to Set Your Contract Address

## Step 1: Deploy the Contract

Run the deployment script:

\`\`\`bash
npm run deploy
\`\`\`

You should see output like:
\`\`\`
Deploying DestinyWarNFT...
DestinyWarNFT deployed to: 0x1234567890abcdef1234567890abcdef12345678
\`\`\`

## Step 2: Copy the Contract Address

Copy the contract address from the deployment output.

## Step 3: Add to Your .env File

Create or edit your `.env.local` file in the root of your project:

\`\`\`bash
# For Windows PowerShell:
echo NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678 >> .env.local

# For Mac/Linux:
echo "NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678" >> .env.local
\`\`\`

Or manually create/edit `.env.local` and add:

\`\`\`env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
\`\`\`

Replace `0x1234567890abcdef1234567890abcdef12345678` with your actual deployed contract address.

## Step 4: Restart Your Dev Server

Stop your Next.js dev server (Ctrl+C) and restart it:

\`\`\`bash
npm run dev
\`\`\`

## Verification

Visit your mint page. The error should be gone and you should be able to mint NFTs!

## Troubleshooting

**Contract address still not detected?**

1. Make sure the file is named `.env.local` (not `.env`)
2. Make sure it's in the root directory of your project
3. Restart your dev server completely
4. Check the environment variable is loaded: add a console.log in your code to verify

**Still having issues?**

You can also set the address directly in Vercel:
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` with your contract address
4. Redeploy your project
