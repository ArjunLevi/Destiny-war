# Domain Setup Guide for Destiny War

This guide will help you connect a custom domain to your Destiny War Farcaster mini app.

## Prerequisites

- A custom domain (e.g., `destinywar.com`)
- Access to your domain's DNS settings
- A Vercel account (or other hosting provider)

---

## Option 1: Deploy on Vercel (Recommended)

Vercel offers the easiest way to deploy Next.js apps with custom domains.

### Step 1: Deploy to Vercel

1. **Push your code to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

### Step 2: Add Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain name (e.g., `destinywar.com`)

### Step 3: Configure DNS

Vercel will provide you with DNS records to add:

**For Root Domain (`destinywar.com`):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www subdomain (`www.destinywar.com`):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### Step 4: Add Domain to Environment Variables

Add these to your `.env` file:

\`\`\`bash
NEXT_PUBLIC_DOMAIN=destinywar.com
NEXT_PUBLIC_SIWE_URI=https://destinywar.com/login
\`\`\`

Then update them in Vercel:
1. Go to Settings → Environment Variables
2. Add `NEXT_PUBLIC_DOMAIN` with your domain
3. Add `NEXT_PUBLIC_SIWE_URI` with your login URL
4. Redeploy your application

---

## Option 2: Other Hosting Providers

### For Netlify:

1. Deploy your Next.js app to Netlify
2. Go to Domain Settings
3. Add custom domain
4. Update DNS with Netlify nameservers or CNAME

### For Your Own Server:

1. Build the production app:
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

2. Configure nginx or Apache to point to your domain

3. Add SSL certificate (recommended: Let's Encrypt)

---

## Farcaster Mini App Configuration

### Step 1: Register Your Mini App Domain

1. Go to [Farcaster Developer Portal](https://warpcast.com/~/developers)
2. Register your application
3. Add your domain to the allowed domains list
4. Add the Farcaster frame URL: `https://farcaster.xyz`

### Step 2: Update Environment Variables

Add to your `.env.local`:

\`\`\`bash
# Your custom domain
NEXT_PUBLIC_DOMAIN=destinywar.com

# Farcaster SIWE URI
NEXT_PUBLIC_SIWE_URI=https://destinywar.com/login

# NFT Contract Address (after deployment)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...

# Your wallet private key (for contract deployment)
PRIVATE_KEY=your_private_key_here

# Basescan API key (for contract verification)
BASESCAN_API_KEY=your_basescan_api_key_here
\`\`\`

### Step 3: Configure Reown AppKit (if using)

If you're using Reown AppKit for Farcaster wallet connections:

1. Get Project ID from [Reown Cloud Dashboard](https://cloud.reown.com)
2. Add your domain and `https://farcaster.xyz` to allowed domains
3. Add to `.env.local`:
   \`\`\`bash
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
   \`\`\`

---

## Testing Your Setup

### 1. Test DNS Propagation

\`\`\`bash
nslookup destinywar.com
\`\`\`

DNS changes can take 24-48 hours to fully propagate.

### 2. Test HTTPS

Visit `https://your-domain.com` and ensure:
- SSL certificate is valid (green padlock)
- No mixed content warnings
- All assets load properly

### 3. Test Farcaster Integration

1. Try connecting with Farcaster wallet
2. Verify authentication works
3. Check that wallet address is retrieved correctly

---

## Troubleshooting

### Domain not resolving
- Wait for DNS propagation (up to 48 hours)
- Verify DNS records are correct
- Clear your DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### SSL certificate errors
- Ensure Vercel has finished generating SSL certificate
- Check that DNS is properly configured
- Wait a few minutes and try again

### Farcaster connection fails
- Verify domain is added to Farcaster app settings
- Check that `NEXT_PUBLIC_DOMAIN` matches your actual domain
- Ensure `https://farcaster.xyz` is in allowed domains
- Check browser console for errors

### Environment variables not working
- Rebuild and redeploy after adding environment variables
- Ensure variable names start with `NEXT_PUBLIC_` for client-side access
- Restart your development server

---

## Quick Checklist

- [ ] Domain purchased and DNS configured
- [ ] App deployed to Vercel or hosting provider
- [ ] Custom domain added in hosting settings
- [ ] DNS records configured (A and CNAME)
- [ ] SSL certificate active
- [ ] Environment variables configured
- [ ] Farcaster app registered
- [ ] Domain added to Farcaster allowed domains
- [ ] Smart contract deployed (if needed)
- [ ] Testing completed

---

## Support Resources

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Farcaster Developer Docs](https://docs.farcaster.xyz/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Base Network Documentation](https://docs.base.org/)

---

Need help? Check the troubleshooting section or reach out to the Destiny War community!
\`\`\`

\`\`\`env file="" isHidden
