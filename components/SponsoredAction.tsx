"use client";

import { type ReactNode } from "react";
import { Transaction, TransactionButton } from "@coinbase/onchainkit/transaction";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import type { Abi, ContractFunctionParameters } from "viem";
import { base } from "viem/chains";

export type SponsoredCall = ContractFunctionParameters<Abi>;

type SponsoredActionProps = {
  calls: SponsoredCall[];
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onStatus?: (status: LifecycleStatus) => void;
};

/** Gas-sponsored tx via OnchainKit Transaction + CDP Paymaster (Smart Wallet / Base App). */
export function SponsoredAction({
  calls,
  children,
  className,
  disabled,
  onSuccess,
  onStatus,
}: SponsoredActionProps) {
  return (
    <Transaction
      isSponsored
      chainId={base.id}
      calls={calls}
      onSuccess={onSuccess}
      onStatus={onStatus}
    >
      <TransactionButton
        className={className}
        disabled={disabled}
        text={children}
      />
    </Transaction>
  );
}
