/**
 * Reference: paid "Revive" API route. After enabling x402 (see ./proxy.ts),
 * place this at app/api/revive/route.ts.
 *
 * The route only returns success AFTER the x402 payment settles, so the client
 * grants the player one extra life. On the client, wrap fetch with payment:
 *
 *   import { wrapFetchWithPayment } from "@x402/evm/client";
 *   const payFetch = wrapFetchWithPayment(fetch, walletClient);
 *   const res = await payFetch("/api/revive", { method: "POST" });
 *   if (res.ok) { /* grant +1 revive, restore HP, continue the run *\/ }
 */
import { NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { server, evmAddress } from "../../../integrations/x402/proxy";

async function handler() {
  // Payment already verified by withX402 before this runs.
  return NextResponse.json({ revived: true, grantedAt: Date.now() });
}

export const POST = withX402(
  handler,
  {
    accepts: [
      { scheme: "exact", price: "$0.10", network: "eip155:8453", payTo: evmAddress },
    ],
    description: "Revive and continue your Arena run",
    mimeType: "application/json",
  },
  server
);
