import type { Hero } from "@/lib/heroes";
import { STAT_INITIAL, STAT_MAX } from "@/lib/gameConstants";

export type OnchainHeroStats = {
  power: number;
  strength: number;
  speed: number;
};

export type ArenaChampion = OnchainHeroStats & {
  tokenId: bigint;
  classId: number;
};

export type ScaledCombatStats = {
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
};

/** Maps hub stat % (10–100) to combat multipliers. */
function statScale(stat: number): number {
  const clamped = Math.max(STAT_INITIAL, Math.min(STAT_MAX, stat));
  return 1 + ((clamped - STAT_INITIAL) / (STAT_MAX - STAT_INITIAL)) * 0.85;
}

export function applyOnchainStats(
  hero: Hero,
  stats: OnchainHeroStats,
): ScaledCombatStats {
  const powerMult = statScale(stats.power);
  const strengthMult = statScale(stats.strength);
  const speedBonus = Math.round((stats.speed - STAT_INITIAL) / 4);

  return {
    maxHp: Math.round(hero.maxHp * strengthMult),
    atk: Math.round(hero.atk * powerMult),
    def: Math.round(hero.def * (1 + (strengthMult - 1) * 0.65)),
    spd: hero.spd + speedBonus,
    crit: Math.min(0.85, hero.crit + (stats.speed - STAT_INITIAL) / 350),
  };
}

/** Average onchain stat % — shown as Arena Power rating. */
export function arenaPowerRating(stats: OnchainHeroStats): number {
  return Math.round((stats.power + stats.strength + stats.speed) / 3);
}

export function kingdomArenaBg(classId: number): string {
  return `/art/class${Math.min(Math.max(classId, 1), 7)}.png`;
}

export function formatOnchainStats(stats: OnchainHeroStats): string {
  return `P ${stats.power}% · S ${stats.strength}% · D ${stats.speed}%`;
}
