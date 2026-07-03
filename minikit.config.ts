const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "https://destinywar.app";

/**
 * Mini App manifest for destinywar.app (Vercel).
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjg2Nzg2OSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweEY3YTE5OWYwMTkzNjExNUU2MWU3OWVDZTM4YmVGOGUwMTJFNjE5NDQifQ",
    payload: "eyJkb21haW4iOiJkZXN0aW55d2FyLmFwcCJ9",
    signature:
      "XPYOFza8KBF2NJz9p6Wqot5faxxgjKDkTg1ocBG6p3hee7EgJcjoz2D4f/nOskFX85PuE/N2UzupGa5mgQf3Uhw=",
  },
  baseBuilder: {
    ownerAddress: "",
  },
  miniapp: {
    version: "1",
    name: "DestinyWar",
    subtitle: "Seven Kingdoms. One War.",
    description:
      "Mint hero NFTs across seven kingdoms on Base. Daily check-ins, scroll wheel, stat upgrades, cinematic arena combat, and weekly Throne rank toward the DWAR community airdrop.",
    screenshotUrls: [
      `${ROOT_URL}/store/screenshot-1-realm.png`,
      `${ROOT_URL}/store/screenshot-2-quest.png`,
      `${ROOT_URL}/store/screenshot-3-arena.png`,
    ],
    iconUrl: `${ROOT_URL}/store/icon-1024.png`,
    splashImageUrl: `${ROOT_URL}/store/splash-200.png`,
    splashBackgroundColor: "#0a1a14",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/farcaster/webhook`,
    primaryCategory: "games",
    tags: ["game", "base", "rpg", "battle", "nft"],
    heroImageUrl: `${ROOT_URL}/store/hero-1200x630.png`,
    tagline: "Seven Kingdoms. One War.",
    ogTitle: "DestinyWar",
    ogDescription: "Mint heroes, quest daily, and battle in the arena on Base.",
    ogImageUrl: `${ROOT_URL}/store/hero-1200x630.png`,
  },
} as const;
