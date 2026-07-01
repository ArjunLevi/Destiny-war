"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Identity,
  Avatar,
  Name,
  Address,
  EthBalance,
  useName,
} from "@coinbase/onchainkit/identity";
import { HEROES } from "@/lib/heroes";
import {
  CLASS_NAMES,
  DESTINY_HUB_ADDRESS,
  hubAbi,
  hubConfigured,
} from "@/lib/contracts";
import { ScrollBadge } from "@/components/ScrollBadge";

export function ProfileTab() {
  const { address, isConnected } = useAccount();

  const { data: baseName, isLoading: nameLoading } = useName({
    address,
    chain: base,
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

  const hasBaseName =
    typeof baseName === "string" &&
    baseName.length > 0 &&
    (baseName.endsWith(".base.eth") || baseName.endsWith(".basetest.eth"));

  if (!isConnected) {
    return (
      <div className="screen profile-tab">
        <h1>Hero Profile</h1>
        <p className="muted">Connect your wallet to view stats and hero NFTs.</p>
        <Wallet>
          <ConnectWallet className="btn" disconnectedLabel="Connect Wallet" />
          <WalletDropdown>
            <Identity hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>
    );
  }

  return (
    <div className="screen profile-tab">
      <h1>Hero Profile</h1>

      <div className="card-panel profile-card">
        <Wallet>
          <Identity hasCopyAddressOnClick className="profile-id">
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdown>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>

        {!nameLoading && hasBaseName && (
          <div className="base-name-banner">
            <span className="base-name-label">Base Name</span>
            <span className="base-name-value">{baseName}</span>
          </div>
        )}
        {!nameLoading && !hasBaseName && (
          <p className="muted base-name-hint">
            No Base Name on this wallet. Register at{" "}
            <a href="https://www.base.org/names" target="_blank" rel="noreferrer">
              base.org/names
            </a>
          </p>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-box stat-box-scrolls">
          <ScrollBadge amount={Number(player?.energy ?? 0n)} large />
        </div>
        <div className="stat-box">
          <span className="stat-val">{Number(player?.streakDay ?? 0n)}/7</span>
          <span className="stat-lbl">Streak</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{Number(nftBalance ?? 0n)}</span>
          <span className="stat-lbl">Hero NFTs</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{weekScore}</span>
          <span className="stat-lbl">Weekly Rank</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{Number(player?.totalSpins ?? 0n)}</span>
          <span className="stat-lbl">Wheel Spins</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{Number(player?.totalUpgrades ?? 0n)}</span>
          <span className="stat-lbl">Upgrades</span>
        </div>
      </div>

      {heroNfts.length > 0 && (
        <section className="card-panel">
          <h2>Your Heroes</h2>
          <div className="nft-grid">
            {heroNfts.map((id) => (
              <HeroNftCard key={id.toString()} tokenId={id} />
            ))}
          </div>
        </section>
      )}

      {hubConfigured && address && (
        <a
          className="btn secondary"
          href={`https://basescan.org/address/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          View on BaseScan
        </a>
      )}
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
    <div className="nft-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hero.portrait} alt={hero.name} />
      <span>#{tokenId.toString()}</span>
      <span>{CLASS_NAMES[cid] ?? hero.name}</span>
    </div>
  );
}
