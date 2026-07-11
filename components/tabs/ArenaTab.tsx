"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Game } from "@/components/Game";
import { KingdomMap } from "@/components/KingdomMap";
import { ArenaLeaderboardPanel } from "@/components/ArenaLeaderboardPanel";
import { useArenaChampions } from "@/lib/useArenaChampions";
import {
  LEADERBOARD_ADDRESS,
  leaderboardAbi,
  leaderboardConfigured,
} from "@/lib/leaderboard";
import { DESTINY_HUB_ADDRESS, hubAbi, hubConfigured } from "@/lib/contracts";

export function ArenaTab() {
  const [inArena, setInArena] = useState(false);
  const [localBest, setLocalBest] = useState(0);
  const { address, isConnected } = useAccount();
  const { championCount, isLoading: championsLoading } = useArenaChampions();

  const { data: onchainBest } = useReadContract({
    address: LEADERBOARD_ADDRESS as `0x${string}`,
    abi: leaderboardAbi,
    functionName: "bestWave",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(leaderboardConfigured && address) },
  });

  const { data: tokenIds } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  useEffect(() => {
    const v = Number(localStorage.getItem("dw_best") || "0");
    if (v) setLocalBest(v);
  }, []);

  useEffect(() => {
    if (!inArena) return;
    const sync = () => {
      const v = Number(localStorage.getItem("dw_best") || "0");
      if (v) setLocalBest(v);
    };
    const id = setInterval(sync, 1500);
    return () => clearInterval(id);
  }, [inArena]);

  const chainBest =
    onchainBest !== undefined ? Number(onchainBest as bigint) : 0;
  const displayBest = Math.max(localBest, chainBest);
  const heroCount = championCount || (tokenIds as bigint[] | undefined)?.length || 0;
  const canFight = isConnected && heroCount > 0;

  if (inArena) {
    return (
      <div className="arena-tab arena-tab-fight">
        <header className="arena-fight-head">
          <button
            type="button"
            className="btn secondary arena-back-btn"
            onClick={() => setInArena(false)}
          >
            ← War Map
          </button>
          {displayBest > 0 && (
            <span className="arena-best-pill">Best · Wave {displayBest}</span>
          )}
        </header>
        <Game embedded startScreen="select" />
      </div>
    );
  }

  return (
    <div className="arena-tab">
      <header className="arena-hero-banner cinematic-banner cinematic-banner--arena">
        <div className="cinematic-banner-shade" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/store/icon-1024.png" alt="" className="arena-hero-logo" />
        <h1>Arena</h1>
        <p className="arena-hero-tag">
          Your NFT champions fight · onchain stats matter · global leaderboard
        </p>
      </header>

      <div className="arena-loop card-panel">
        <span className="arena-loop-step">1. Mint</span>
        <span className="arena-loop-arrow">→</span>
        <span className="arena-loop-step">2. Quest</span>
        <span className="arena-loop-arrow">→</span>
        <span className="arena-loop-step active">3. Arena</span>
      </div>

      <div className="arena-stats card-panel">
        <div className="arena-stat">
          <span className="arena-stat-val">{displayBest > 0 ? displayBest : "—"}</span>
          <span className="arena-stat-lbl">Best wave</span>
        </div>
        <div className="arena-stat">
          <span className="arena-stat-val">{isConnected ? heroCount : "—"}</span>
          <span className="arena-stat-lbl">NFT champions</span>
        </div>
        <div className="arena-stat">
          <span className="arena-stat-val">{chainBest > 0 ? chainBest : "—"}</span>
          <span className="arena-stat-lbl">Onchain best</span>
        </div>
      </div>

      <ArenaLeaderboardPanel />

      <KingdomMap />

      <section className="arena-cta card-panel">
        <div className="arena-cta-art" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/walking_character.gif" alt="" className="arena-walker" />
        </div>
        <h2>Enter the War</h2>
        <p className="muted">
          Deploy a minted champion with onchain Power, Strength, and Speed.
          Higher Quest upgrades = stronger Arena runs and better leaderboard scores.
        </p>
        {!isConnected ? (
          <p className="arena-cta-hint">Connect wallet to enter with your NFTs.</p>
        ) : championsLoading ? (
          <p className="arena-cta-hint">Loading champions…</p>
        ) : heroCount === 0 ? (
          <p className="arena-cta-hint">Mint a champion on Realm first.</p>
        ) : null}
        <button
          type="button"
          className="btn gold arena-enter-btn pulse"
          disabled={!canFight && isConnected}
          onClick={() => setInArena(true)}
        >
          ⚔ Deploy Champion
        </button>
      </section>
    </div>
  );
}
