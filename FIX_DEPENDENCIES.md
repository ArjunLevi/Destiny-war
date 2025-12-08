# Fix Hardhat Dependencies Issue

The issue is caused by npm's strict peer dependency resolution. Here's how to fix it:

## Quick Fix (Windows)

Run this in PowerShell:

\`\`\`powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install --legacy-peer-deps
\`\`\`

Or simply run the batch file:
\`\`\`
install.bat
\`\`\`

## Quick Fix (Mac/Linux)

Run this in terminal:

\`\`\`bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
\`\`\`

Or simply run:
\`\`\`bash
chmod +x install.sh
./install.sh
\`\`\`

## What This Does

The `--legacy-peer-deps` flag tells npm to use the old peer dependency resolution algorithm, which is more lenient and won't fail on version mismatches that are actually compatible.

## After Installation

Once dependencies are installed, you can proceed with:

1. Set up your `.env` file with your `PRIVATE_KEY`
2. Run `npm run deploy` to deploy to Base mainnet
3. The contract address will be automatically saved

## Why This Happens

The Hardhat ecosystem has version conflicts between different packages. The Material-UI packages and Hardhat packages have different peer dependency requirements. Using `--legacy-peer-deps` resolves this safely.
