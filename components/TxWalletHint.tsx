"use client";

import { DESTINY_HUB_ADDRESS, hubConfigured } from "@/lib/contracts";

/** Human-readable labels for hub txs (shown in-app before the wallet popup). */
export const HUB_TX_LABELS = {
  mintHero: "Mint Champion NFT",
  checkIn: "Daily Check-in",
  upgradeStat: "Upgrade Hero Stat",
  spin: "Spin Scroll Wheel",
  approveUsdc: "Approve USDC for Mint",
} as const;

export function TxWalletHint({ action }: { action: keyof typeof HUB_TX_LABELS }) {
  const basescan = hubConfigured
    ? `https://basescan.org/address/${DESTINY_HUB_ADDRESS}#code`
    : null;

  return (
    <p className="tx-wallet-hint">
      Wallet will request: <strong>{HUB_TX_LABELS[action]}</strong>
      {basescan ? (
        <>
          {" "}
          ·{" "}
          <a href={basescan} target="_blank" rel="noopener noreferrer" className="tx-wallet-link">
            View on Basescan
          </a>
        </>
      ) : null}
    </p>
  );
}
