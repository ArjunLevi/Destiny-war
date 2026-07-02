"use client";

import { Kingdom } from "@/lib/lore";
import { HEROES } from "@/lib/heroes";
import { MintCard } from "@/components/MintCard";
import { MINT_PRICE_USDC } from "@/lib/contracts";

export function KingdomMintSheet({
  kingdom,
  onClose,
}: {
  kingdom: Kingdom;
  onClose: () => void;
}) {
  const hero = HEROES.find((h) => h.id === kingdom.id) ?? HEROES[0];

  return (
    <div className="realm-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="realm-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`realm-title-${kingdom.id}`}
      >
        <button type="button" className="realm-sheet-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="realm-sheet-banner-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={kingdom.banner}
            alt={`${kingdom.realm} — ${kingdom.name}`}
            className="realm-sheet-banner"
          />
          <div className="realm-sheet-banner-fade" aria-hidden />
          <div className="realm-sheet-banner-meta">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={kingdom.logo} alt="" className="realm-sheet-sigil" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={kingdom.title}
              alt={kingdom.name}
              className="realm-sheet-class-title"
              id={`realm-title-${kingdom.id}`}
            />
          </div>
        </div>

        <div className="realm-sheet-body">
          <p className="realm-sheet-realm">{kingdom.realm}</p>

          <section className="realm-lore-block">
            <h3 className="realm-lore-heading">History</h3>
            <p className="realm-lore-text">{kingdom.lore}</p>
          </section>

          <section className="realm-lore-block">
            <h3 className="realm-lore-heading">Characteristic</h3>
            <p className="realm-lore-text">{hero.blurb}</p>
            <p className="realm-skill">
              <strong>{hero.skill.name}</strong> — {hero.skill.desc}
            </p>
          </section>

          <div className="realm-stats">
            <div className="realm-stat">
              <span className="realm-stat-val">{hero.maxHp}</span>
              <span className="realm-stat-lbl">HP</span>
            </div>
            <div className="realm-stat">
              <span className="realm-stat-val">{hero.atk}</span>
              <span className="realm-stat-lbl">ATK</span>
            </div>
            <div className="realm-stat">
              <span className="realm-stat-val">{hero.def}</span>
              <span className="realm-stat-lbl">DEF</span>
            </div>
            <div className="realm-stat">
              <span className="realm-stat-val">{hero.spd}</span>
              <span className="realm-stat-lbl">SPD</span>
            </div>
            <div className="realm-stat">
              <span className="realm-stat-val">{Math.round(hero.crit * 100)}%</span>
              <span className="realm-stat-lbl">CRIT</span>
            </div>
          </div>

          <section className="realm-mint-panel card-panel">
            <h3 className="realm-mint-heading">Recruit Champion</h3>
            <p className="muted realm-mint-sub">
              Mint this hero as an NFT on Base · {MINT_PRICE_USDC} USDC each
            </p>
            <div className="realm-mint-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.portrait}
                alt={hero.name}
                className="realm-mint-portrait"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.title} alt={hero.name} className="realm-mint-title" />
            </div>
            <MintCard heroId={kingdom.id} compact />
          </section>
        </div>
      </div>
    </div>
  );
}
