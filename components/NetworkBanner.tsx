"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

export function NetworkBanner() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === base.id) return null;

  const networkName =
    chainId === 11155111
      ? "Sepolia"
      : chainId === 84532
        ? "Base Sepolia"
        : `Chain ${chainId}`;

  return (
    <div className="network-banner" role="alert">
      <p>
        You are on <strong>{networkName}</strong>. Destiny War runs on{" "}
        <strong>Base</strong> — your contract and USDC are there, not on testnets.
      </p>
      <button
        type="button"
        className="btn gold network-switch-btn"
        disabled={isPending}
        onClick={() => switchChain({ chainId: base.id })}
      >
        {isPending ? "Switching…" : "Switch to Base"}
      </button>
    </div>
  );
}
