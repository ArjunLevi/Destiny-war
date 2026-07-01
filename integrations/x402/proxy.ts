/**
 * x402 reference config — OPTIONAL paid features (e.g. a paid "Revive/Continue").
 *
 * This file is intentionally OUTSIDE the Next build (see tsconfig "exclude").
 * To enable x402:
 *   1) npm i @x402/next @x402/core @x402/evm @x402/paywall
 *   2) Move this file to the project root as `proxy.ts`
 *   3) Add an API route (see ./revive-route.ts) under app/api/revive/route.ts
 *   4) Set X402_PAY_TO to your receiving wallet (gets USDC on Base)
 *
 * Docs: https://docs.x402.org/getting-started/quickstart-for-sellers
 */
import { paymentProxy } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

export const evmAddress = (process.env.X402_PAY_TO || "0x0000000000000000000000000000000000000000") as `0x${string}`;

const facilitator = new HTTPFacilitatorClient({ url: "https://x402.org/facilitator" });

// Use "eip155:8453" for Base mainnet, "eip155:84532" for Base Sepolia while testing.
export const server = new x402ResourceServer(facilitator).register(
  "eip155:8453",
  new ExactEvmScheme()
);

export const proxy = paymentProxy(
  {
    "/api/revive": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.10",
          network: "eip155:8453",
          payTo: evmAddress,
        },
      ],
      description: "Revive and continue your Arena run",
      mimeType: "application/json",
    },
  },
  server
);

export const config = { matcher: ["/api/revive/:path*"] };
