# Farcaster Mini App Setup Guide

This guide will help you integrate Destiny War as a Farcaster Mini App.

## Prerequisites

1. Node.js 22.11.0 or higher installed
2. Deployed app with a custom domain
3. Farcaster account with Developer Mode enabled

## Step 1: Enable Developer Mode in Farcaster

1. Open Farcaster (Warpcast) app
2. Go to Settings: https://farcaster.xyz/~/settings/developer-tools
3. Toggle on "Developer Mode"

## Step 2: Configure Your Domain

Update `public/.well-known/farcaster.json` with your actual domain:

\`\`\`json
{
  "frame": {
    "version": "next",
    "name": "Destiny War",
    "iconUrl": "https://YOUR_DOMAIN.com/images/logo.png",
    "homeUrl": "https://YOUR_DOMAIN.com",
    "imageUrl": "https://YOUR_DOMAIN.com/og-image.png",
    "buttonTitle": "Play Destiny War",
    "splashImageUrl": "https://YOUR_DOMAIN.com/images/logo.png",
    "splashBackgroundColor": "#000000"
  }
}
\`\`\`

Replace `YOUR_DOMAIN.com` with your actual domain.

## Step 3: Set Environment Variables

Add to your `.env` file:

\`\`\`bash
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN.com
NEXT_PUBLIC_FARCASTER_APP_NAME=Destiny War
\`\`\`

## Step 4: Deploy Your App

\`\`\`bash
npm run build
npm run deploy
\`\`\`

Or deploy to Vercel:
\`\`\`bash
vercel --prod
\`\`\`

## Step 5: Register Your Mini App

1. Go to https://farcaster.xyz/~/developers/frames
2. Click "New Frame"
3. Enter your app URL: `https://YOUR_DOMAIN.com`
4. The Farcaster client will automatically detect your app configuration from `/.well-known/farcaster.json`

## Step 6: Test Your Mini App

1. Open Farcaster app
2. Go to Mini Apps section
3. Find "Destiny War" in the list
4. Click to launch your game

## Features Available in Mini App

When running inside Farcaster, your app has access to:

- **User Context**: Automatically logged in with Farcaster account
- **Wallet Connection**: Direct access to user's connected wallet
- **Notifications**: Can send updates to users
- **Share功能**: Users can share battles and achievements

## Debugging

To test locally before deploying:

1. Use ngrok to expose your local server:
   \`\`\`bash
   ngrok http 3000
   \`\`\`

2. Update `farcaster.json` with your ngrok URL

3. Test in Farcaster Developer Mode

## Common Issues

**Issue**: App doesn't load in Farcaster
- Solution: Ensure `sdk.actions.ready()` is called after app loads
- Check browser console for errors

**Issue**: Wallet not connecting
- Solution: Farcaster users are automatically authenticated
- Use `useFarcasterContext()` hook to access user info

**Issue**: 404 on .well-known/farcaster.json
- Solution: Ensure the file is in `public/.well-known/` directory
- Check that your hosting serves static files from public folder

## Next Steps

- Customize the splash screen image
- Add Farcaster-specific features using the SDK
- Implement notifications for battle results
- Add share buttons for achievements

For more information, visit: https://miniapps.farcaster.xyz/docs
