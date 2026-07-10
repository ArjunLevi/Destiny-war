"use client";

import { useEffect, useMemo, useState } from "react";
import { useCapabilities, useChainId, useAccount } from "wagmi";
import { useIsInMiniApp } from "@coinbase/onchainkit/minikit";
import { base } from "viem/chains";
import { clientPaymasterEnabled, getClientPaymasterUrl } from "@/lib/paymaster";

type PaymasterHealth = {
  ok: boolean;
  billingOk?: boolean;
  error?: string;
};

export function usePaymasterStatus() {
  const chainId = useChainId();
  const targetChainId = chainId || base.id;
  const { connector } = useAccount();
  const { isInMiniApp } = useIsInMiniApp();
  const { data: capabilities } = useCapabilities({ chainId: targetChainId });
  const [health, setHealth] = useState<PaymasterHealth | null>(null);

  useEffect(() => {
    if (!clientPaymasterEnabled()) {
      setHealth({ ok: false, error: "Missing NEXT_PUBLIC_ONCHAINKIT_API_KEY" });
      return;
    }

    let cancelled = false;
    fetch(getClientPaymasterUrl(), { method: "GET" })
      .then(async (res) => {
        const data = (await res.json()) as PaymasterHealth;
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) {
          setHealth({ ok: false, error: "Could not reach /api/paymaster" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  const billingOk = health?.billingOk !== false && health?.ok !== false;
  const walletReady =
    walletSupportsPaymaster || isInMiniApp === true || isCoinbaseWallet;

  return {
    paymasterConfigured: clientPaymasterEnabled(),
    walletSupportsPaymaster,
    isInMiniApp: isInMiniApp === true,
    billingOk: health?.billingOk ?? null,
    healthError: health?.error ?? null,
    gasSponsored:
      clientPaymasterEnabled() && billingOk && walletReady,
  };
}
