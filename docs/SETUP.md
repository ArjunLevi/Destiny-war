# Destiny War — Base Mini App Setup

Five tabs: **Home** (mint), **Loop** (check-in + upgrades + spin), **Rank**
(weekly leaderboard), **Drop** (airdrop / tokenomics), **Shop** (marketplace).

All core gameplay uses one contract: **`DestinyWarHub.sol`**.

| Action | Tx | Cost |
| --- | --- | --- |
| Mint hero NFT | 1 | 0.01 USDC each |
| Daily check-in | 1 | gas (sponsor via Paymaster) |
| Upgrade stat (+1 Power/Str/Spd) | 1 | 1 energy + gas |
| Spin wheel | 1 | 30 energy + gas |

**Energy math:** each hero starts at **10%** per stat (max **100%**).  
270 energy total to max one hero (90 × 3 stats). Daily check-in = **9 energy** → **30 days** to max if all energy goes to upgrades.

Deploy **`DestinyWarHub.sol`** with Base USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`, then set:

```
NEXT_PUBLIC_DESTINY_HUB_ADDRESS=0xYourHub
```

Legacy env vars `NEXT_PUBLIC_HERO_MINT_ADDRESS` / `NEXT_PUBLIC_DAILY_STRIKE_ADDRESS` still work as fallbacks.

---

## 1. Run locally

```bash
cd miniapp
copy .env.local.example .env.local   # Windows  (cp on macOS/Linux)
npm install
npm run dev
```

Open the printed URL (http://localhost:3000 or 3001). The game is fully playable
with no env vars. To enable wallet UI/leaderboard you'll add values below.

---

## 2. Get an OnchainKit API key

1. Go to the Coinbase Developer Platform: https://portal.cdp.coinbase.com
2. Create a project → copy the **Client API Key**.
3. Put it in `.env.local`:

```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key_here
```

---

## 3. Deploy HeroMint (0.01 USDC per NFT)

1. Open Remix → create `HeroMint.sol` (paste from `contracts/HeroMint.sol`).
2. Enable OpenZeppelin imports in Remix (or flatten).
3. Deploy with constructor arg: Base USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`.
4. Set `NEXT_PUBLIC_HERO_MINT_ADDRESS=0xYourContract`.
5. Call `withdraw()` as owner anytime to pull accumulated USDC mint fees.

Users mint 1–20 heroes per tx. Classes 1–7: Fighter, Swordsman, Mage, Ninja,
Priest, Taoist, Knight.

---

## 4. Deploy DailyStrike v2 (Day Loop — check-in + spin + map)

1. Deploy `contracts/DailyStrike.sol` with constructor: Base USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`.
2. Set `NEXT_PUBLIC_DAILY_STRIKE_ADDRESS=0xYourContract`.
3. Set `SPIN_VOUCHER_PRIVATE_KEY` on server (Vercel) for x402/voucher spins; call `setVoucherSigner(pubkey)` on contract.

**Day Loop txs per active user:**

| Step | Action | Txs |
| --- | --- | --- |
| 1 | Check-in | 1 |
| 2 | Spin (energy) | 1 each (3–10/day) |
| 3 | Map send + claim | 2 per node (up to 12) |
| **Total** | | **~10–23/day** |

**Paid spin (USDC to you):**
- `buyEnergyPack()` — 0.05 USDC → +30 energy
- `spinPaid()` — 0.05 USDC → spin without energy
- **x402** — pay via facilitator + `spinWithVoucher` (1 gas tx); set API key + voucher signer

---

## 5. Deploy ArenaLeaderboard (battle scores)

This is what gives each user repeatable onchain transactions and powers ranking.
The cheapest path is **Remix** (browser, no installs). Base gas is a fraction of a cent.

1. Open https://remix.ethereum.org
2. Create `ArenaLeaderboard.sol` and paste the contents of
   [`contracts/ArenaLeaderboard.sol`](../contracts/ArenaLeaderboard.sol).
3. **Solidity Compiler** tab → compile (0.8.20+).
4. **Deploy & Run** tab:
   - Environment: **Injected Provider** (your wallet, e.g. Coinbase Wallet/MetaMask).
   - Switch the wallet network to **Base Mainnet** (chainId 8453). You need a tiny
     bit of ETH on Base for gas (cents).
   - Click **Deploy**, confirm.
5. Copy the deployed contract address into `.env.local`:

```
NEXT_PUBLIC_LEADERBOARD_ADDRESS=0xYourDeployedContract
```

Now the game-over screen shows the **Top Champions** board and a **Save Wave N
onchain** button. Each press = one `submitScore(wave)` transaction.

> Tip: keep using Base Sepolia (testnet) first if you want to test for free, then
> redeploy to mainnet for real ranking.

---

## 4. Register the Base Mini App + get your Builder Code (ranking)

To appear in the Base App and climb the **base.dev App Leaderboard**:

### 4a. Register the app

1. Deploy the app publicly first (see Section 5) so you have an HTTPS domain.
2. Go to **https://base.dev** → sign in → add your Mini App (point it at your
   deployed URL). This reads your manifest at
   `https://your-domain/.well-known/farcaster.json`.

### 4b. Sign the manifest (account association)

The manifest must be signed for YOUR domain. Use the Base/Farcaster manifest tool
(linked from base.dev when you add the app, or the Farcaster Mini App manifest
tool). It produces a signed `accountAssociation` (`header`, `payload`,
`signature`). Paste those three values into [`minikit.config.ts`](../minikit.config.ts):

```ts
accountAssociation: {
  header: "…",
  payload: "…",
  signature: "…",
},
```

Then redeploy. Validate at the Base Mini App preview/debug tool.

### 4c. Builder Code (automatic attribution → leaderboard)

- On base.dev → **Settings → Builder Code**, claim your free code.
- Once your app is registered, **the Base App automatically appends your Builder
  Code (ERC-8021 `dataSuffix`) to every transaction users make inside your app** —
  including the `submitScore` calls above. No code change needed.
- Track attribution at base.dev → select **Onchain** → **Total Transactions**.

> Advanced (only if running outside the Base App, e.g. a plain website): append the
> suffix manually. Upgrade `ox` to a version with `Attribution.toDataSuffix`, build
> the suffix from your Builder Code, and pass `dataSuffix` to wagmi's
> `useWriteContract`. Inside the Base App this is unnecessary.

---

## 5. Deploy the app (Vercel recommended)

1. Push `miniapp/` to a Git repo.
2. Import into https://vercel.com (framework auto-detected as Next.js).
3. Set env vars in Vercel:
   - `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
   - `NEXT_PUBLIC_URL=https://your-app.vercel.app`
   - `NEXT_PUBLIC_LEADERBOARD_ADDRESS=0x…`
4. Deploy. Confirm `https://your-app.vercel.app/.well-known/farcaster.json` returns JSON.

---

## 6. (Optional) x402 — paid extras in USDC

x402 lets you charge tiny USDC payments per request (e.g. a paid **Revive/Continue**).
Reference files live in [`integrations/x402/`](../integrations/x402) (excluded from
the app build). To enable:

```bash
npm i @x402/next @x402/core @x402/evm @x402/paywall
```

1. Move `integrations/x402/proxy.ts` to the project root as `proxy.ts`.
2. Create `app/api/revive/route.ts` from `integrations/x402/revive-route.ts`.
3. Set `X402_PAY_TO` (your receiving wallet) in `.env.local`.
4. Client side, wrap fetch with payment and call `/api/revive`:

```ts
import { wrapFetchWithPayment } from "@x402/evm/client";
const payFetch = wrapFetchWithPayment(fetch, walletClient);
const res = await payFetch("/api/revive", { method: "POST" });
if (res.ok) { /* grant +1 revive, restore HP, continue */ }
```

Players pay USDC on Base; you receive it instantly. Keep prices tiny ($0.05–$0.25).

---

## 7. (Optional) MCP — expose the leaderboard to AI agents

A standalone MCP server is in [`integrations/mcp-server/`](../integrations/mcp-server).
It exposes `get_leaderboard` and `get_player_best` tools that AI agents can call.

```bash
cd integrations/mcp-server
npm install
LEADERBOARD_ADDRESS=0xYourContract node index.mjs
```

Register it in your MCP client (Cursor/Claude) as a stdio server. You can later
combine this with x402 to offer **paid** agent tools.

---

## What each piece maps to

| Your request | Where it lives |
| --- | --- |
| Use background images | `public/art/menubg.png`, `selectbg.png`, `class1–7.png` (battle), `mapbg.jpg` |
| Use the fonts | `public/fonts/*` + `@font-face` in `app/globals.css` (AmericanCaptain / AgencyFB) |
| More interesting game | energy + skills, status effects (burn/poison/stun/weaken/shield), boss waves, roguelite power-ups — `components/Game.tsx` |
| Per-user txns + leaderboard ranking | `contracts/ArenaLeaderboard.sol` + `components/Leaderboard.tsx` + Builder Code |
| x402 | `integrations/x402/` |
| MCP | `integrations/mcp-server/` |
| Register Base mini app | Section 4 above |
