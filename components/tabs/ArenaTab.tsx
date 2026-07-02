"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Game } from "@/components/Game";
import { KingdomMap } from "@/components/KingdomMap";
import { DESTINY_HUB_ADDRESS, hubAbi, hubConfigured } from "@/lib/contracts";

export function ArenaTab() {
  const [inArena, setInArena] = useState(false);
  const [best, setBest] = useState(0);
  const { address, isConnected } = useAccount();

  const { data: tokenIds } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  useEffect(() => {
    const v = Number(localStorage.getItem("dw_best") || "0");
    if (v) setBest(v);
  }, []);

  useEffect(() => {
    if (!inArena) return;
    const sync = () => {
      const v = Number(localStorage.getItem("dw_best") || "0");
      if (v) setBest(v);
    };
    const id = setInterval(sync, 1500);
    return () => clearInterval(id);
  }, [inArena]);

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
          {best > 0 && (
            <span className="arena-best-pill">Best · Wave {best}</span>
          )}
        </header>
        <Game embedded startScreen="select" />
      </div>
    );
  }

  const heroCount = (tokenIds as bigint[] | undefined)?.length ?? 0;

  return (
    <div className="arena-tab">
      <header className="arena-hero-banner">
        <div className="arena-hero-glow" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/logo.png" alt="" className="arena-hero-logo" />
        <h1>Arena</h1>
        <p className="arena-hero-tag">
          Endless waves · boss every 5 · onchain leaderboard
        </p>
      </header>

      <div className="arena-stats card-panel">
        <div className="arena-stat">
          <span className="arena-stat-val">{best > 0 ? best : "—"}</span>
          <span className="arena-stat-lbl">Best wave</span>
        </div>
        <div className="arena-stat">
          <span className="arena-stat-val">{isConnected ? heroCount : "—"}</span>
          <span className="arena-stat-lbl">Champions</span>
        </div>
        <div className="arena-stat">
          <span className="arena-stat-val">∞</span>
          <span className="arena-stat-lbl">Waves</span>
        </div>
      </div>

      <KingdomMap />

      <section className="arena-cta card-panel">
        <div className="arena-cta-art" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/walking_character.gif" alt="" className="arena-walker" />
        </div>
        <h2>Enter the War</h2>
        <p className="muted">
          Pick a champion, survive escalating waves, and climb the onchain arena
          leaderboard. Upgrade stats in Quest for stronger runs.
        </p>
        <button
          type="button"
          className="btn gold arena-enter-btn pulse"
          onClick={() => setInArena(true)}
        >
          ⚔ Enter Arena
        </button>
      </section>
    </div>
  );
}
