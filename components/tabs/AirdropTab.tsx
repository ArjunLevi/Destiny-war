"use client";

const TOKENOMICS = [
  { img: "/art/tokenomics/1.png", label: "30% — Community Rewards" },
  { img: "/art/tokenomics/2.png", label: "10% — Founders" },
  { img: "/art/tokenomics/3.png", label: "10% — Charity" },
  { img: "/art/tokenomics/4.png", label: "15% — Development" },
  { img: "/art/tokenomics/5.png", label: "35% — Burned" },
];

export function AirdropTab() {
  return (
    <div className="screen airdrop-tab">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/tokenomics/tokenomic_text.png"
        alt="Tokenomics"
        className="airdrop-heading-img"
      />

      <div className="airdrop-hero card-panel">
        <h1>Token Airdrop</h1>
        <p className="airdrop-badge">BEP-20 · Coming to Base</p>
        <p className="muted">
          Destiny War is preparing a fair launch token aligned with weekly
          leaderboard points. Play now — check in, upgrade heroes, spin, and
          climb the rank for giveaway allocation when we go live.
        </p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/tokenomics/token_supply.png"
        alt="Token supply"
        className="airdrop-supply-img"
      />

      <h2 className="airdrop-section-title">Token distribution</h2>
      <div className="tokenomics-grid">
        {TOKENOMICS.map((t) => (
          <div key={t.img} className="tokenomics-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.img} alt={t.label} />
            <p>{t.label}</p>
          </div>
        ))}
      </div>

      <div className="card-panel airdrop-steps">
        <h2>How to qualify</h2>
        <ol className="airdrop-list">
          <li>Mint hero NFTs on Home (0.01 USDC each)</li>
          <li>Check in daily on Hero Loop for scrolls</li>
          <li>Upgrade Power, Strength, Speed onchain</li>
          <li>Spin the wheel and stack weekly rank points</li>
          <li>Top weekly scores receive token points at TGE</li>
        </ol>
      </div>
    </div>
  );
}
