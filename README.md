# Destiny War - Mint-to-Play NFT Battle Arena

A Web3 gaming experience built on Base Network where players mint character NFTs and battle in an epic arena.

## Features

- **NFT Character Minting** - Mint unique warrior NFTs (0.0001 ETH each)
- **Wallet Integration** - Connect via Browser Wallet or Farcaster
- **Turn-Based Combat** - Strategic battle system with multiple attack types
- **Leaderboard System** - Compete for top rankings
- **Base Network** - Built on Base mainnet for fast, low-cost transactions

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Material-UI + Tailwind CSS
- **Blockchain**: Ethers.js + Hardhat
- **Authentication**: Farcaster AuthKit + Browser Wallets
- **Network**: Base Mainnet (Chain ID: 8453)

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- Some ETH on Base mainnet for gas fees

### 1. Installation

\`\`\`bash
npm install
\`\`\`

### 2. Environment Setup

Copy the example environment file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your values:

\`\`\`bash
# Required for smart contract deployment
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# Required for Farcaster integration
NEXT_PUBLIC_DOMAIN=localhost:3000
NEXT_PUBLIC_SIWE_URI=http://localhost:3000/login

# Will be added after contract deployment
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=
\`\`\`

### 3. Deploy Smart Contract

Run the interactive setup script:

\`\`\`bash
npm run setup
\`\`\`

This will guide you through:
- Checking your wallet balance
- Deploying the NFT contract to Base mainnet
- Verifying the contract on BaseScan
- Automatically updating your `.env.local`

Or deploy manually:

\`\`\`bash
npm run deploy:base
\`\`\`

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Smart Contract Deployment

### Automated Setup (Recommended)

\`\`\`bash
npm run setup
\`\`\`

### Manual Deployment

1. **Get ETH on Base Mainnet**
   - Bridge ETH to Base: https://bridge.base.org
   - Or buy directly on Base

2. **Get BaseScan API Key**
   - Sign up at https://basescan.org
   - Go to API Keys and create a new key

3. **Add Private Key**
   - Export from MetaMask: Settings → Security & Privacy → Reveal Private Key
   - Add to `.env.local` as `PRIVATE_KEY`

4. **Deploy Contract**
   \`\`\`bash
   npm run deploy:base
   \`\`\`

5. **Copy Contract Address**
   - Update `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` in `.env.local`
   - Restart your dev server

6. **Verify Contract (Optional)**
   \`\`\`bash
   npm run verify <CONTRACT_ADDRESS>
   \`\`\`

---

## Farcaster Integration

### Setup Farcaster Wallet Connection

1. **Register Your App** (for production)
   - Go to https://warpcast.com/~/developers
   - Register your application
   - Add your domain to allowed domains
   - Add `https://farcaster.xyz` to allowed domains

2. **Update Environment Variables**
   \`\`\`bash
   NEXT_PUBLIC_DOMAIN=your-domain.com
   NEXT_PUBLIC_SIWE_URI=https://your-domain.com/login
   \`\`\`

3. **Test Connection**
   - Click "Connect Wallet" button
   - Select "Farcaster Wallet"
   - Authenticate via Farcaster

### Development Mode

In development, Farcaster auth works with `localhost:3000`. No additional setup needed.

---

## Domain Setup

See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for detailed instructions on:
- Connecting a custom domain
- Deploying to Vercel
- Configuring DNS records
- Setting up SSL certificates
- Farcaster mini app configuration

---

## Project Structure

\`\`\`
destiny-war/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── mint/              # NFT minting page
│   ├── play/              # Character selection
│   ├── battle/            # Battle arena
│   └── leaderboard/       # Rankings
├── components/            # React components
│   ├── wallet-connect-modal.tsx
│   └── footer.tsx
├── lib/                   # Utilities and configs
│   ├── theme/             # Material-UI theme
│   ├── utils/             # Helper functions
│   ├── contracts/         # Contract ABIs & interactions
│   └── farcaster/         # Farcaster auth provider
├── contracts/             # Solidity smart contracts
│   └── DestinyWarNFT.sol
├── scripts/               # Deployment scripts
│   ├── deploy.js
│   └── setup.js
├── public/                # Static assets
│   └── images/            # Character images & logos
└── hardhat.config.js      # Hardhat configuration
\`\`\`

---

## Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run setup        # Interactive contract deployment setup
npm run deploy:base  # Deploy contract to Base mainnet
npm run deploy:testnet  # Deploy to Base Sepolia testnet
npm run verify       # Verify contract on BaseScan
\`\`\`

---

## Gameplay Guide

### 1. Connect Wallet
- Click "Connect Wallet" in the header
- Choose Browser Wallet or Farcaster
- Approve the connection

### 2. Mint a Character
- Navigate to "Mint Character"
- Choose from 6 unique warriors (3 teams)
- Pay 0.0001 ETH to mint your NFT
- Wait for transaction confirmation

### 3. Select Your Fighter
- Go to "Play" page
- View your owned character NFTs
- Select a character to enter battle

### 4. Battle Arena
- Face off against AI opponents
- Choose from 3 attack types:
  - Quick Strike: Fast but moderate damage
  - Power Smash: High damage, slower
  - Tactical Hit: Balanced attack
- Win battles to earn points and climb the leaderboard

### 5. Leaderboard
- View top players and their stats
- Track your ranking
- See win streaks and battle records

---

## Troubleshooting

### Contract Deployment Issues

**"Insufficient funds"**
- Ensure you have at least 0.01 ETH on Base mainnet
- Check your balance: https://basescan.org

**"Network error"**
- Verify you're connected to Base mainnet (Chain ID: 8453)
- Check RPC endpoint is responding

### Wallet Connection Issues

**"No browser wallet detected"**
- Install MetaMask or another Web3 wallet
- Enable the wallet extension

**"Wrong network"**
- The app will prompt you to switch to Base mainnet
- Approve the network switch in your wallet

### Farcaster Connection Issues

**"Failed to connect with Farcaster"**
- Ensure your domain is registered with Farcaster
- Check that `NEXT_PUBLIC_DOMAIN` is correct
- Verify `https://farcaster.xyz` is in allowed domains

### Minting Issues

**"Transaction failed"**
- Check you have enough ETH for gas + mint price (0.0001 ETH)
- Ensure contract address is set in environment variables
- Try increasing gas limit in wallet

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes (deploy) | Wallet private key for contract deployment |
| `BASESCAN_API_KEY` | Yes (verify) | API key for contract verification |
| `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` | Yes | Deployed contract address |
| `NEXT_PUBLIC_DOMAIN` | Yes | Your app domain (or localhost) |
| `NEXT_PUBLIC_SIWE_URI` | Yes | Sign-In With Ethereum URI |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Optional | Reown/WalletConnect project ID |

---

## Security Notes

- **Never commit `.env.local`** - Contains sensitive keys
- **Never share your `PRIVATE_KEY`** - Anyone with it can access your wallet
- **Use a deployment wallet** - Don't use your main wallet for deployments
- **Verify contracts** - Always verify on BaseScan after deployment
- **Test on testnet first** - Use Base Sepolia before mainnet

---

## Links

- **Live App**: [Your deployed URL]
- **Contract**: [BaseScan link after deployment]
- **Base Network**: https://base.org
- **BaseScan**: https://basescan.org
- **Base Bridge**: https://bridge.base.org
- **Farcaster**: https://www.farcaster.xyz

---

## License

MIT

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for domain issues
3. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for contract issues

Built with ⚔️ by the Destiny War team
