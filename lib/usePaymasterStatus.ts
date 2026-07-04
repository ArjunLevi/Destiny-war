"use client";

import { useMemo } from "react";
import { useCapabilities, useChainId } from "wagmi";
import { base } from "viem/chains";
import { paymasterEnabled } from "@/lib/paymaster";

export function usePaymasterStatus() {
  const chainId = useChainId();
  const targetChainId = chainId || base.id;
  const { data: capabilities } = useCapabilities();

  const walletSupportsPaymaster = useMemo(
    () =>
      capabilities?.[targetChainId]?.paymasterService?.supported === true,
    [capabilities, targetChainId],
  );

  return {
    paymasterConfigured: paymasterEnabled,
    walletSupportsPaymaster,
    gasSponsored: paymasterEnabled && walletSupportsPaymaster,
  };
}
