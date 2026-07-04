import { base, baseSepolia } from "viem/chains";

export const APP_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || base.id);

/** True in the browser when a CDP client key is configured. */
export function clientPaymasterEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY);
}

/** Server/build-time check (includes server-only paymaster URL). */
export const paymasterEnabled = Boolean(
  process.env.CDP_PAYMASTER_URL ||
    process.env.CDP_API_KEY ||
    process.env.ONCHAINKIT_API_KEY ||
    process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY,
);

/** Client-side URL for wallet_sendCalls paymasterService (proxied, no raw CDP key). */
export function getClientPaymasterUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/api/paymaster`;
  }
  return "/api/paymaster";
}

export function resolvePaymasterRpcUrl(): string | null {
  if (process.env.CDP_PAYMASTER_URL) {
    return process.env.CDP_PAYMASTER_URL;
  }

  const key =
    process.env.CDP_API_KEY ||
    process.env.ONCHAINKIT_API_KEY ||
    process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;

  if (!key) return null;

  const network = APP_CHAIN_ID === baseSepolia.id ? "base-sepolia" : "base";
  return `https://api.developer.coinbase.com/rpc/v1/${network}/${key}`;
}
