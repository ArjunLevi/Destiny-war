"use client";

import type { Hero } from "@/lib/heroes";
import { kingdomArenaBg } from "@/lib/arenaCombat";

export type CombatFxKind =
  | "player-attack"
  | "player-skill"
  | "player-defend"
  | "enemy-attack"
  | "enemy-skill";

export type CombatFx = {
  kind: CombatFxKind;
  key: number;
  damage?: number;
  crit?: boolean;
};

type FighterSide = {
  hero: Hero;
  hp: number;
  maxHp: number;
  isBoss?: boolean;
};

export function BattleField({
  player,
  enemy,
  wave,
  isBoss,
  combatFx,
  hitTarget,
  hitKey,
  skillReady,
  playerClassId,
}: {
  player: FighterSide;
  enemy: FighterSide;
  wave: number;
  isBoss: boolean;
  combatFx: CombatFx | null;
  hitTarget: "player" | "enemy" | null;
  hitKey: number;
  skillReady: boolean;
  playerClassId?: number;
}) {
  const themeId = playerClassId ?? player.hero.id;
  const fxClass = combatFx ? `fx-${combatFx.kind}` : "";
  const fxKey = combatFx?.key ?? 0;
  const arenaBg = kingdomArenaBg(themeId);

  return (
    <div
      className={`battlefield bf-theme-${themeId} ${isBoss ? "bf-boss" : ""} ${fxClass}`}
      data-fx-key={fxKey}
      style={{
        backgroundImage: `url(${arenaBg})`,
      }}
    >
      <div className="bf-sky" aria-hidden />
      <div className="bf-parallax bf-parallax-back" aria-hidden />
      <div className="bf-parallax bf-parallax-mid" aria-hidden />
      <div className="bf-ground" aria-hidden />
      <div className="bf-vignette" aria-hidden />

      <div className="bf-particles" aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className="bf-ember" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {isBoss && <div className="bf-boss-aura" aria-hidden />}

      <div className="bf-stage">
        <div
          className={`bf-side bf-side-player ${hitTarget === "player" ? "bf-hit" : ""} ${skillReady ? "bf-skill-ready" : ""}`}
          key={`p${hitKey}`}
        >
          <div className="bf-fighter-wrap">
            <div className="bf-fighter-shadow" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={player.hero.portrait}
              alt={player.hero.name}
              className="bf-fighter bf-fighter-you bf-idle"
            />
            {combatFx?.kind === "player-attack" && (
              <span className="bf-slash bf-slash-right" aria-hidden />
            )}
            {combatFx?.kind === "player-skill" && (
              <span className="bf-skill-burst bf-skill-right" aria-hidden />
            )}
            {combatFx?.kind === "player-defend" && (
              <span className="bf-shield-ring" aria-hidden />
            )}
          </div>
          {combatFx?.damage != null && hitTarget === "player" && (
            <span
              className={`bf-dmg-pop bf-dmg-player ${combatFx.crit ? "bf-dmg-crit" : ""}`}
              key={`dmg-p-${fxKey}`}
            >
              -{combatFx.damage}
              {combatFx.crit ? "!" : ""}
            </span>
          )}
        </div>

        <div className="bf-center">
          <span className="bf-wave-tag">W{wave}</span>
          <span className="bf-vs">⚔</span>
          {isBoss && <span className="bf-boss-label">BOSS</span>}
        </div>

        <div
          className={`bf-side bf-side-enemy ${hitTarget === "enemy" ? "bf-hit" : ""}`}
          key={`e${hitKey}`}
        >
          <div className="bf-fighter-wrap">
            <div className="bf-fighter-shadow" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enemy.hero.portrait}
              alt={enemy.hero.name}
              className={`bf-fighter bf-fighter-foe bf-idle ${enemy.isBoss ? "bf-fighter-boss" : ""}`}
            />
            {(combatFx?.kind === "enemy-attack" || combatFx?.kind === "enemy-skill") && (
              <span className="bf-slash bf-slash-left" aria-hidden />
            )}
          </div>
          {combatFx?.damage != null && hitTarget === "enemy" && (
            <span
              className={`bf-dmg-pop bf-dmg-enemy ${combatFx.crit ? "bf-dmg-crit" : ""}`}
              key={`dmg-e-${fxKey}`}
            >
              -{combatFx.damage}
              {combatFx.crit ? "!" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="bf-scanlines" aria-hidden />
    </div>
  );
}
