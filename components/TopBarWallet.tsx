"use client";

import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Address } from "@coinbase/onchainkit/identity";

export function TopBarWallet() {
  return (
    <div className="home-wallet-slot">
      <Wallet>
        <ConnectWallet className="top-wallet-btn" disconnectedLabel="Connect Wallet" />
        <WalletDropdown>
          <Identity hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
