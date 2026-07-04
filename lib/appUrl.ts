/** Canonical public origin — always production domain unless overridden. */
export const APP_ORIGIN = (
  process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "") || "https://destinywar.app"
).replace(/\/$/, "");

/** Square store icon for wallets, favicons, and Base App manifest. */
export const APP_ICON_URL = `${APP_ORIGIN}/store/icon-1024.png`;
