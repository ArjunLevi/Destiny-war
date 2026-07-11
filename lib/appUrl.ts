/** Canonical public origin — always production domain unless overridden. */
export const APP_ORIGIN = (
  process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "") || "https://destinywar.app"
).replace(/\/$/, "");

/** Relative wallet/favicon icon — always resolves on the current site origin. */
export const APP_ICON_PATH = "/store/splash-200.png";

/** Absolute icon URL for manifests and external tooling. */
export const APP_ICON_URL = `${APP_ORIGIN}${APP_ICON_PATH}`;
