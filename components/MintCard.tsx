"use client";

import { useState, useEffect } from "react";
import { parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useWriteContractWithBuilder } from "@/lib/useWriteContractWithBuilder";
import { DestinyWallet } from "@/components/DestinyWallet";
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

function friendlyTxError(err: unknown): string {
  const msg =
    (err as { shortMessage?: string; message?: string }).shortMessage ||
    (err as { message?: string }).message ||
    "";
  if (/rejected|denied|cancel/i.test(msg)) {
    return "Cancelled in wallet — tap Mint again when ready.";
  }
  if (/insufficient/i.test(msg)) {
    return "Not enough USDC or ETH on Base.";
  }
  return msg || "Transaction failed";
}

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

  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: approvePending,
    error: approveError,
  } = useWriteContractWithBuilder();
  const { isLoading: approveConfirming, isSuccess: approveDone } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const {
    writeContract: writeMint,
    data: mintHash,
    isPending: mintPending,
    error: mintError,
  } = useWriteContractWithBuilder();
  const { isLoading: mintConfirming, isSuccess: mintDone } =
    useWaitForTransactionReceipt({ hash: mintHash });

  useEffect(() => {
    if (approveDone) refetchAllowance();
  }, [approveDone, refetchAllowance]);

  const approve = () =>
    writeApprove({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [DESTINY_HUB_ADDRESS as `0x${string}`, total],
    });

  const mint = () =>
    writeMint({
      address: DESTINY_HUB_ADDRESS as `0x${string}`,
      abi: hubAbi,
      functionName: "mintHero",
      args: [heroId, BigInt(qty)],
    });

  const busy = approvePending || approveConfirming || mintPending || mintConfirming;
  const err = approveError || mintError;

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
          <button className="btn gold mint-btn" onClick={approve} disabled={busy || !hasEnoughUsdc}>
            {approvePending || approveConfirming ? "Approving…" : "1. Approve USDC"}
          </button>
          <TxWalletHint action="approveUsdc" />
        </>
      ) : (
        <>
          <button className="btn gold mint-btn" onClick={mint} disabled={busy || !hasEnoughUsdc}>
            {mintPending || mintConfirming
              ? "Minting…"
              : mintDone
                ? "Champion Minted ✓"
                : `Mint ${qty} ${hero.name}${qty > 1 ? "s" : ""}`}
          </button>
          {!mintDone && !busy && <TxWalletHint action="mintHero" />}
        </>
      )}
      {!hasEnoughUsdc && isConnected && hubConfigured && (
        <p className="mint-warn">Need {(MINT_PRICE_USDC * qty).toFixed(2)} USDC on Base</p>
      )}
      {err && <p className="mint-err">{friendlyTxError(err)}</p>}
    </div>
  );
}
