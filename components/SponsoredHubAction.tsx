"use client";

import { type ReactNode } from "react";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import type { ContractFunctionParameters } from "viem";
import { DESTINY_HUB_ADDRESS, hubAbi } from "@/lib/contracts";
import { SponsoredAction } from "@/components/SponsoredAction";

export type HubCall = ContractFunctionParameters<typeof hubAbi>;

type SponsoredHubActionProps = {
  call: HubCall;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onStatus?: (status: LifecycleStatus) => void;
};

/** Gas-sponsored hub tx via OnchainKit + CDP Paymaster (Smart Wallet / Base App). */
export function SponsoredHubAction(props: SponsoredHubActionProps) {
  const { call, ...rest } = props;
  return (
    <SponsoredAction
      {...rest}
      calls={[
        {
          ...call,
          address: (call.address ?? DESTINY_HUB_ADDRESS) as `0x${string}`,
        },
      ]}
    />
  );
}
