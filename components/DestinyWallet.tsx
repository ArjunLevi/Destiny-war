"use client";

import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Address } from "@coinbase/onchainkit/identity";

export type DestinyWalletVariant = "topbar" | "cta" | "inline";

export function DestinyWallet({
  variant = "inline",
  disconnectedLabel = "Connect Wallet",
}: {
  variant?: DestinyWalletVariant;
  disconnectedLabel?: string;
}) {
  return (
    <div className={`destiny-wallet destiny-wallet--${variant}`}>
      <Wallet>
        <ConnectWallet
          className={`destiny-wallet-btn destiny-wallet-btn--${variant}`}
          disconnectedLabel={disconnectedLabel}
        />
        <WalletDropdown className="destiny-wallet-dropdown">
          <Identity hasCopyAddressOnClick className="destiny-wallet-identity">
            <Avatar className="destiny-wallet-avatar" />
            <div className="destiny-wallet-id-text">
              <Name className="destiny-wallet-name" />
              <Address className="destiny-wallet-address" />
            </div>
          </Identity>
          <WalletDropdownDisconnect className="destiny-wallet-disconnect" />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
