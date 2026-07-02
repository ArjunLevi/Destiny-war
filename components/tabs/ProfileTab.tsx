"use client";

import { useMemo } from "react";
import { useAccount, useBalance, useDisconnect, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { formatEther } from "viem";
import {
  Wallet,
  ConnectWallet,
} from "@coinbase/onchainkit/wallet";
import { useAvatar } from "@coinbase/onchainkit/identity";
import { HEROES } from "@/lib/heroes";
import {
  CLASS_NAMES,
  DESTINY_HUB_ADDRESS,
  hubAbi,
  hubConfigured,
} from "@/lib/contracts";
import { ScrollBadge } from "@/components/ScrollBadge";
import { useBasename } from "@/lib/useBasename";

function sliceAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function ProfileTab() {
  const { address, isConnected } = useAccount();

  const { data: baseName, isLoading: nameLoading } = useBasename(address);

  const { data: ethBalance } = useBalance({
    address,
    chainId: base.id,
  });

  const { data: playerRaw } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "getPlayer",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { data: weekly } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "getWeeklyScore",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { data: tokenIds } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { data: nftBalance } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const player = playerRaw as
    | {
        energy: bigint;
        streakDay: bigint;
        totalCheckIns: bigint;
        totalSpins: bigint;
        totalUpgrades: bigint;
      }
    | undefined;

  const ids = (tokenIds as bigint[] | undefined) ?? [];
  const heroNfts = useMemo(() => ids.slice(0, 12), [ids]);
  const weekScore = weekly ? Number((weekly as [bigint, bigint])[1]) : 0;
  const streakDay = Number(player?.streakDay ?? 0n);
  const hasBaseName = typeof baseName === "string" && baseName.length > 0;
  const displayTitle = hasBaseName
    ? baseName.replace(/\.(base|basetest)\.eth$/, "")
    : address
      ? sliceAddress(address)
      : "Unknown Hero";
  const ethLabel = ethBalance
    ? `${Number(formatEther(ethBalance.value)).toFixed(4)} ETH`
    : "— ETH";

  const { data: avatarUrl } = useAvatar(
    { ensName: baseName ?? "", chain: base },
    { enabled: Boolean(baseName) },
  );

  const { disconnect, connectors } = useDisconnect();

  const handleDisconnect = () => {
    connectors.forEach((connector) => disconnect({ connector }));
  };

  if (!isConnected) {
    return (
      <div className="screen profile-tab">
        <header className="profile-header">
          <h1>Hero Profile</h1>
          <p className="muted profile-sub">Your realm identity &amp; battle record</p>
        </header>

        <div className="profile-empty card-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/walking.gif" alt="" className="profile-empty-art" />
          <p className="profile-empty-title">No hero linked yet</p>
          <p className="muted profile-empty-text">
            Connect your wallet to view stats, scrolls, and hero NFTs.
          </p>
          <Wallet>
            <ConnectWallet className="btn gold" disconnectedLabel="Connect Wallet" />
          </Wallet>
        </div>
      </div>
    );
  }

  return (
    <div className="screen profile-tab">
      <header className="profile-header">
        <h1>Hero Profile</h1>
        <p className="muted profile-sub">Your realm identity &amp; battle record</p>
      </header>

      <section className="profile-hero card-panel">
        <div className="profile-hero-banner" aria-hidden />
        <div className="profile-hero-main">
          <div className="profile-avatar-ring">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-fallback">
                {displayTitle.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-hero-meta">
            <div className="profile-name-row">
              <h2 className="profile-display-name">{displayTitle}</h2>
              {hasBaseName && <span className="profile-base-badge">Base Name</span>}
            </div>
            {hasBaseName && address && (
              <p className="profile-basename-full">{baseName}</p>
            )}
            <button
              type="button"
              className="profile-address-chip"
              onClick={() => address && navigator.clipboard.writeText(address)}
              title="Copy address"
            >
              {address ? sliceAddress(address) : "—"}
              <span className="profile-address-dot">·</span>
              {ethLabel}
            </button>
          </div>
        </div>

        {!nameLoading && !hasBaseName && (
          <p className="profile-basename-hint">
            Set a primary Base Name at{" "}
            <a href="https://www.base.org/names" target="_blank" rel="noreferrer">
              base.org/names
            </a>
          </p>
        )}

        <div className="profile-hero-actions">
          <button
            type="button"
            className="btn secondary profile-disconnect"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
          {hubConfigured && address && (
            <a
              className="btn secondary profile-basescan"
              href={`https://basescan.org/address/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              BaseScan
            </a>
          )}
        </div>
      </section>

      <section className="profile-stats-section">
        <h2 className="profile-section-title">War Ledger</h2>

        <div className="profile-scrolls card-panel">
          <ScrollBadge amount={Number(player?.energy ?? 0n)} large />
          <p className="muted profile-scrolls-note">Scrolls fuel upgrades &amp; spins</p>
        </div>

        <div className="profile-streak card-panel">
          <div className="profile-streak-head">
            <span className="profile-streak-label">Daily Streak</span>
            <span className="profile-streak-val">
              {streakDay}
              <span className="profile-streak-max">/7</span>
            </span>
          </div>
          <div className="profile-streak-track" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={i}
                className={`profile-streak-pip ${i < streakDay ? "filled" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="stats-grid profile-stats-grid">
          <div className="stat-box profile-stat">
            <span className="stat-val">{Number(nftBalance ?? 0n)}</span>
            <span className="stat-lbl">Hero NFTs</span>
          </div>
          <div className="stat-box profile-stat">
            <span className="stat-val">{weekScore}</span>
            <span className="stat-lbl">Weekly Pts</span>
          </div>
          <div className="stat-box profile-stat">
            <span className="stat-val">{Number(player?.totalSpins ?? 0n)}</span>
            <span className="stat-lbl">Wheel Spins</span>
          </div>
          <div className="stat-box profile-stat">
            <span className="stat-val">{Number(player?.totalUpgrades ?? 0n)}</span>
            <span className="stat-lbl">Upgrades</span>
          </div>
        </div>
      </section>

      <section className="card-panel profile-heroes-panel">
        <div className="profile-heroes-head">
          <h2>Your Heroes</h2>
          <span className="profile-heroes-count">{Number(nftBalance ?? 0n)} minted</span>
        </div>

        {heroNfts.length > 0 ? (
          <div className="nft-grid profile-nft-grid">
            {heroNfts.map((id) => (
              <HeroNftCard key={id.toString()} tokenId={id} />
            ))}
          </div>
        ) : (
          <div className="profile-heroes-empty">
            <p className="muted">No hero NFTs yet — mint your first champion on the Realm tab.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function HeroNftCard({ tokenId }: { tokenId: bigint }) {
  const { data: classId } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "heroClass",
    args: [tokenId],
    query: { enabled: hubConfigured },
  });

  const cid = Number(classId ?? 1);
  const hero = HEROES.find((h) => h.id === cid) ?? HEROES[0];

  return (
    <div className="nft-card profile-nft-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hero.portrait} alt={hero.name} />
      <span className="profile-nft-id">#{tokenId.toString()}</span>
      <span className="profile-nft-class">{CLASS_NAMES[cid] ?? hero.name}</span>
    </div>
  );
}
