"use client";

import { useMemo } from "react";
import { useCapabilities, useChainId, useAccount } from "wagmi";
import { useIsInMiniApp } from "@coinbase/onchainkit/minikit";
import { base } from "viem/chains";
import { clientPaymasterEnabled } from "@/lib/paymaster";

export function usePaymasterStatus() {
  const chainId = useChainId();
  const targetChainId = chainId || base.id;
  const { connector } = useAccount();
  const { isInMiniApp } = useIsInMiniApp();
  const { data: capabilities } = useCapabilities({ chainId: targetChainId });

  const walletSupportsPaymaster = useMemo(
    () =>
      capabilities?.[targetChainId]?.paymasterService?.supported === true,
    [capabilities, targetChainId],
  );

  const isCoinbaseWallet = useMemo(() => {
    const id = connector?.id?.toLowerCase() ?? "";
    const name = connector?.name?.toLowerCase() ?? "";
    return (
      id.includes("coinbase") ||
      id.includes("farcaster") ||
      name.includes("coinbase") ||
      name.includes("base")
    );
  }, [connector?.id, connector?.name]);

  const gasSponsored =
    clientPaymasterEnabled() &&
    (walletSupportsPaymaster || isInMiniApp === true || isCoinbaseWallet);

  return {
    paymasterConfigured: clientPaymasterEnabled(),
    walletSupportsPaymaster,
    isInMiniApp: isInMiniApp === true,
    gasSponsored,
  };
}
