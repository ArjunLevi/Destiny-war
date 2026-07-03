"use client";

import { DestinyWallet } from "@/components/DestinyWallet";

export function TopBarWallet() {
  return (
    <div className="home-wallet-slot">
      <DestinyWallet variant="topbar" disconnectedLabel="Connect Wallet" />
    </div>
  );
}
