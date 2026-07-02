"use client";

import { useState, useCallback, useRef, type TouchEvent } from "react";
import { useAccount } from "wagmi";
import { hubConfigured } from "@/lib/contracts";
import { KINGDOMS, Kingdom } from "@/lib/lore";
import { TopBarWallet } from "@/components/TopBarWallet";
import { AppFooter } from "@/components/AppFooter";
import { KingdomMintSheet } from "@/components/KingdomMintSheet";

export function HomeTab({ onLoop }: { onLoop: () => void }) {
  const { isConnected } = useAccount();
  const [index, setIndex] = useState(0);
  const [selectedKingdom, setSelectedKingdom] = useState<Kingdom | null>(null);
  const touchStart = useRef<number | null>(null);

  const kingdom = KINGDOMS[index];

  const goTo = useCallback((next: number) => {
    setIndex((next + KINGDOMS.length) % KINGDOMS.length);
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 48) {
      goTo(delta > 0 ? index - 1 : index + 1);
    }
    touchStart.current = null;
  };

  return (
    <div className="screen home-tab home-tab-cinematic">
      <header className="home-cine-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/logo.png" alt="Destiny War" className="home-cine-logo" />
        <TopBarWallet />
      </header>

      <p className="home-cine-eyebrow">Seven Kingdoms · One War</p>

      <div
        className="home-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          className="home-stage-arrow home-stage-arrow-left"
          onClick={() => goTo(index - 1)}
          aria-label="Previous kingdom"
        >
          ‹
        </button>

        <button
          type="button"
          className="home-stage-frame"
          onClick={() => setSelectedKingdom(kingdom)}
          aria-label={`Open ${kingdom.realm} — ${kingdom.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={kingdom.id}
            src={kingdom.banner}
            alt={`${kingdom.realm} — ${kingdom.name}`}
            className="home-stage-art"
          />
          <span className="home-stage-tap-hint">Tap to explore &amp; mint</span>
        </button>

        <button
          type="button"
          className="home-stage-arrow home-stage-arrow-right"
          onClick={() => goTo(index + 1)}
          aria-label="Next kingdom"
        >
          ›
        </button>
      </div>

      <div className="home-sigil-bar" role="tablist" aria-label="Select kingdom">
        {KINGDOMS.map((k, i) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`home-sigil ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={k.realm}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={k.logo} alt="" />
          </button>
        ))}
      </div>

      <p className="home-cine-realm">
        <span className="home-cine-realm-name">{kingdom.realm}</span>
        <span className="home-cine-realm-sep">·</span>
        <span className="home-cine-realm-class">{kingdom.name}</span>
      </p>

      <div className="home-cine-actions">
        <button
          type="button"
          className="btn gold home-cine-primary"
          onClick={() => setSelectedKingdom(kingdom)}
        >
          Explore &amp; Mint
        </button>
        <button type="button" className="btn secondary home-cine-secondary" onClick={onLoop}>
          Hero Loop
        </button>
      </div>

      {!hubConfigured && (
        <p className="note home-cine-note">
          Set <code>NEXT_PUBLIC_DESTINY_HUB_ADDRESS</code> after deploying the hub contract.
        </p>
      )}

      {!isConnected && (
        <p className="muted home-cine-note">Connect wallet inside any kingdom to mint.</p>
      )}

      <AppFooter />

      {selectedKingdom && (
        <KingdomMintSheet
          kingdom={selectedKingdom}
          onClose={() => setSelectedKingdom(null)}
        />
      )}
    </div>
  );
}
