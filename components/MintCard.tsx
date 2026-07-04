"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { DestinyWallet } from "@/components/DestinyWallet";
import { SponsoredAction } from "@/components/SponsoredAction";
import { TxWalletHint } from "@/components/TxWalletHint";
import { HEROES } from "@/lib/heroes";
import {
  USDC_ADDRESS,
  USDC_DECIMALS,
  MINT_PRICE_USDC,
  DESTINY_HUB_ADDRESS,
  hubAbi,
  hubConfigured,
  erc20Abi,
} from "@/lib/contracts";

export function MintCard({
  heroId,
  compact,
}: {
  heroId: number;
  compact?: boolean;
}) {
  const hero = HEROES.find((h) => h.id === heroId)!;
  const { address, isConnected } = useAccount();
  const [qty, setQty] = useState(1);
  const [mintDone, setMintDone] = useState(false);

  const total = parseUnits(String(MINT_PRICE_USDC * qty), USDC_DECIMALS);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args:
      address && hubConfigured
        ? ([address, DESTINY_HUB_ADDRESS as `0x${string}`] as const)
        : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const needsApproval =
    allowance !== undefined && (allowance as bigint) < total;

  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const hasEnoughUsdc =
    usdcBalance !== undefined && (usdcBalance as bigint) >= total;

  const onApproveSuccess = () => {
    refetchAllowance();
  };

  const onMintSuccess = () => {
    setMintDone(true);
  };

  return (
    <div className={`mint-card ${compact ? "mint-card-compact" : ""}`}>
      {!compact && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.portrait} alt={hero.name} className="mint-portrait" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.title} alt={hero.name} className="mint-title" />
        </>
      )}
      <div className="mint-qty">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
          −
        </button>
        <span>{qty}</span>
        <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} disabled={qty >= 20}>
          +
        </button>
      </div>
      <p className="mint-price">{(MINT_PRICE_USDC * qty).toFixed(2)} USDC</p>
      {!hubConfigured ? (
        <button className="btn secondary mint-btn" disabled>
          Deploy contract
        </button>
      ) : !isConnected ? (
        <>
          <DestinyWallet variant="cta" disconnectedLabel="Connect to Mint" />
          <TxWalletHint action="mintHero" />
        </>
      ) : needsApproval ? (
        <>
          <SponsoredAction
            calls={[
              {
                address: USDC_ADDRESS,
                abi: erc20Abi,
                functionName: "approve",
                args: [DESTINY_HUB_ADDRESS as `0x${string}`, total],
              },
            ]}
            className="btn gold mint-btn sponsored-tx-btn"
            disabled={!hasEnoughUsdc}
            onSuccess={onApproveSuccess}
          >
            1. Approve USDC
          </SponsoredAction>
          <TxWalletHint action="approveUsdc" />
        </>
      ) : (
        <>
          <SponsoredAction
            calls={[
              {
                address: DESTINY_HUB_ADDRESS as `0x${string}`,
                abi: hubAbi,
                functionName: "mintHero",
                args: [heroId, BigInt(qty)],
              },
            ]}
            className="btn gold mint-btn sponsored-tx-btn"
            disabled={!hasEnoughUsdc || mintDone}
            onSuccess={onMintSuccess}
          >
            {mintDone
              ? "Champion Minted ✓"
              : `Mint ${qty} ${hero.name}${qty > 1 ? "s" : ""}`}
          </SponsoredAction>
          {!mintDone && <TxWalletHint action="mintHero" />}
        </>
      )}
      {!hasEnoughUsdc && isConnected && hubConfigured && (
        <p className="mint-warn">Need {(MINT_PRICE_USDC * qty).toFixed(2)} USDC on Base</p>
      )}
      <p className="muted mint-gas-note">
        Mint costs USDC only — gas is sponsored in Base App ($0 ETH).
      </p>
    </div>
  );
}
