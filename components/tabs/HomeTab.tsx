"use client";

import { useState, useEffect } from "react";
import { parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  useBalance,
} from "wagmi";
import { base } from "wagmi/chains";
import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";
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
import { TopBarWallet } from "@/components/TopBarWallet";
import { AppFooter } from "@/components/AppFooter";

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

function MintCard({ heroId }: { heroId: number }) {
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
  } = useWriteContract();
  const { isLoading: approveConfirming, isSuccess: approveDone } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const {
    writeContract: writeMint,
    data: mintHash,
    isPending: mintPending,
    error: mintError,
  } = useWriteContract();
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
    <div className="mint-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hero.portrait} alt={hero.name} className="mint-portrait" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hero.title} alt={hero.name} className="mint-title" />
      <div className="mint-qty">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
          −
        </button>
        <span>{qty}</span>
        <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} disabled={qty >= 20}>
          +
        </button>
      </div>
      <p className="mint-price">
        {(MINT_PRICE_USDC * qty).toFixed(2)} USDC
      </p>
      {!hubConfigured ? (
        <button className="btn secondary mint-btn" disabled>
          Deploy contract
        </button>
      ) : !isConnected ? (
        <Wallet>
          <ConnectWallet className="btn mint-btn" disconnectedLabel="Connect" />
        </Wallet>
      ) : needsApproval ? (
        <button className="btn gold mint-btn" onClick={approve} disabled={busy || !hasEnoughUsdc}>
          {approvePending || approveConfirming ? "Approving…" : "1. Approve USDC"}
        </button>
      ) : (
        <button className="btn mint-btn" onClick={mint} disabled={busy || !hasEnoughUsdc}>
          {mintPending || mintConfirming ? "Minting…" : mintDone ? "Minted ✓" : "2. Mint NFT"}
        </button>
      )}
      {!hasEnoughUsdc && isConnected && hubConfigured && (
        <p className="mint-warn">Need {(MINT_PRICE_USDC * qty).toFixed(2)} USDC on Base</p>
      )}
      {err && (
        <p className="mint-err">{friendlyTxError(err)}</p>
      )}
    </div>
  );
}

export function HomeTab({ onLoop }: { onLoop: () => void }) {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    chainId: base.id,
  });
  const lowEth =
    ethBalance !== undefined && ethBalance.value < BigInt(500_000_000_000_000);

  return (
    <div className="screen home-tab">
      <header className="home-topbar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/walking.gif" alt="" className="home-walker" />
        <TopBarWallet />
      </header>

      <div className="home-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/logo.png" alt="Destiny War" className="home-logo" />
        <h1>Destiny War</h1>
        <p className="home-tagline">
          Mint hero NFTs · upgrade stats onchain · climb the weekly rank
        </p>
        <button type="button" className="btn gold home-arena-btn" onClick={onLoop}>
          Hero Loop
        </button>
      </div>

      <section className="mint-section">
        <h2>Mint Your Heroes</h2>
        <p className="muted mint-sub">
          Each hero becomes an NFT on Base ·{" "}
          <strong>{MINT_PRICE_USDC} USDC</strong> per mint
        </p>
        {isConnected && (
          <div className="mint-requirements card-panel">
            <p className="mint-req-title">Before you mint on Base</p>
            <ul className="mint-req-list">
              <li>
                <strong>Network:</strong> Base (MetaMask may show “ETH” — that is
                normal; gas on Base is paid in ETH on Base, not Sepolia)
              </li>
              <li>
                <strong>Step 1:</strong> Approve USDC → <strong>Step 2:</strong> Mint NFT
              </li>
              <li>
                <strong>USDC on Base</strong> for the mint price ({MINT_PRICE_USDC} each)
              </li>
              <li>
                <strong>A little ETH on Base</strong> for gas (~$0.01–0.05)
              </li>
            </ul>
            {lowEth && (
              <p className="mint-warn">
                Low ETH on Base — bridge or buy ETH on Base for gas fees.
              </p>
            )}
          </div>
        )}
        <div className="mint-grid">
          {HEROES.map((h) => (
            <MintCard key={h.id} heroId={h.id} />
          ))}
        </div>
        {!hubConfigured && (
          <p className="note">
            Set <code>NEXT_PUBLIC_DESTINY_HUB_ADDRESS</code> after deploying{" "}
            <code>DestinyWarHub.sol</code> (see docs/SETUP.md).
          </p>
        )}
      </section>

      <AppFooter />
    </div>
  );
}
