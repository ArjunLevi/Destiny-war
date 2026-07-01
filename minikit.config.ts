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
    name: "Destiny War Arena",
    subtitle: "Turn-based hero battler",
    description:
      "Pick a hero and battle endless waves of foes in this free turn-based mini game on Base.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/art/logo.png`,
    splashImageUrl: `${ROOT_URL}/art/logo.png`,
    splashBackgroundColor: "#0b3d2e",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/farcaster/webhook`,
    primaryCategory: "games",
    tags: ["game", "base", "rpg", "battle", "arcade"],
    heroImageUrl: `${ROOT_URL}/art/hero1.png`,
    tagline: "Battle endless waves on Base",
    ogTitle: "Destiny War Arena",
    ogDescription: "How many waves can you survive?",
    ogImageUrl: `${ROOT_URL}/art/hero1.png`,
  },
} as const;
