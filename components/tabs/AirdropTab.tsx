"use client";

import { useState } from "react";

type Segment = {
  id: string;
  label: string;
  shortLabel: string;
  pct: string;
  img: string;
  zone: { top: string; left: string; width: string; height: string };
};

const SEGMENTS: Segment[] = [
  {
    id: "reward",
    label: "30% — Community Rewards",
    shortLabel: "Reward",
    pct: "30%",
    img: "/art/tokenomics/1.png",
    zone: { top: "10%", left: "0%", width: "46%", height: "40%" },
  },
  {
    id: "burned",
    label: "35% — Burned",
    shortLabel: "Burned",
    pct: "35%",
    img: "/art/tokenomics/5.png",
    zone: { top: "6%", left: "50%", width: "50%", height: "44%" },
  },
  {
    id: "founders",
    label: "10% — Founders",
    shortLabel: "Founders",
    pct: "10%",
    img: "/art/tokenomics/2.png",
    zone: { top: "56%", left: "0%", width: "40%", height: "40%" },
  },
  {
    id: "charity",
    label: "10% — Charity",
    shortLabel: "Charity",
    pct: "10%",
    img: "/art/tokenomics/3.png",
    zone: { top: "66%", left: "30%", width: "38%", height: "32%" },
  },
  {
    id: "development",
    label: "15% — Development",
    shortLabel: "Development",
    pct: "15%",
    img: "/art/tokenomics/4.png",
    zone: { top: "50%", left: "56%", width: "44%", height: "46%" },
  },
];

function TokenomicsModal({
  segment,
  onClose,
}: {
  segment: Segment;
  onClose: () => void;
}) {
  return (
    <div
      className="treasury-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="treasury-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`treasury-segment-${segment.id}`}
      >
        <button
          type="button"
          className="treasury-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="treasury-modal-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={segment.img}
            alt={segment.label}
            className="treasury-modal-img"
            id={`treasury-segment-${segment.id}`}
          />
        </div>
        <p className="treasury-modal-caption">{segment.label}</p>
      </div>
    </div>
  );
}

export function AirdropTab() {
  const [active, setActive] = useState<Segment | null>(null);

  return (
    <div className="screen airdrop-tab">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/tokenomics/tokenomic_text.png"
        alt="Tokenomics"
        className="treasury-heading-img"
      />

      <p className="treasury-tagline">
        Tap any slice on the chart to reveal allocation details
      </p>

      <div className="treasury-chart-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/art/tokenomics/tokenomic.png"
          alt="Destiny War token distribution chart"
          className="treasury-chart-img"
        />
        <div className="treasury-chart-zones">
          {SEGMENTS.map((seg) => (
            <button
              key={seg.id}
              type="button"
              className="treasury-chart-zone"
              style={seg.zone}
              onClick={() => setActive(seg)}
              aria-label={`View ${seg.label} details`}
            />
          ))}
        </div>
      </div>

      <div className="treasury-chips">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            type="button"
            className="treasury-chip"
            onClick={() => setActive(seg)}
          >
            <span className="treasury-chip-pct">{seg.pct}</span>
            {seg.shortLabel}
          </button>
        ))}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/tokenomics/token_supply.png"
        alt="Token supply"
        className="treasury-supply-img"
      />

      <div className="card-panel treasury-hero">
        <h1>Destiny War Token</h1>
        <p className="treasury-badge">Fair launch · Base network</p>
        <p className="muted treasury-desc">
          Weekly leaderboard points convert to giveaway allocation at TGE.
          Play now — check in, upgrade heroes, spin, and climb the rank.
        </p>
      </div>

      <div className="card-panel treasury-steps">
        <h2>How to qualify</h2>
        <ol className="treasury-list">
          <li>Mint hero NFTs on Realm (0.01 USDC each)</li>
          <li>Check in daily on Quest for scrolls</li>
          <li>Upgrade Power, Strength, Speed onchain</li>
          <li>Spin the wheel and stack weekly rank points</li>
          <li>Top weekly scores receive token points at TGE</li>
        </ol>
      </div>

      <section className="card-panel treasury-bazaar">
        <h2>Bazaar</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/art/maintenance.gif"
          alt="Under maintenance"
          className="treasury-bazaar-gif"
        />
        <p className="treasury-bazaar-soon">Coming soon</p>
        <p className="muted treasury-bazaar-desc">
          Trade hero gear and items on the DWAR marketplace. Stay tuned.
        </p>
      </section>

      {active && (
        <TokenomicsModal segment={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}
