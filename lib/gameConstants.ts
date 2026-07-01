/** Onchain game math — must match DestinyWarHub.sol */

export const STAT_INITIAL = 10;
export const STAT_MAX = 100;
export const STAT_TYPES = ["power", "strength", "speed"] as const;
export type StatType = (typeof STAT_TYPES)[number];

/** Points per stat to max: 100 - 10 = 90; × 3 stats = 270 per hero */
export const ENERGY_TO_MAX_HERO =
  (STAT_MAX - STAT_INITIAL) * STAT_TYPES.length;

/** Daily check-in = 9 energy → 9 × 30 = 270 (max one hero in 30 days if all spent on upgrades) */
export const DAILY_ENERGY = 9;
export const STREAK7_ENERGY = 18;
export const DAYS_TO_MAX_HERO = ENERGY_TO_MAX_HERO / DAILY_ENERGY;

export const SPIN_COST = 30;
export const SPIN_REWARDS = [0, 20, 30, 60, 20, 30] as const;
/** Weights sum to 100 — slots 2 & 5 (30 energy) are most likely */
export const SPIN_WEIGHTS = [10, 15, 30, 5, 15, 25] as const;

export const SPIN_OUTCOMES = SPIN_REWARDS.map((reward, id) => ({
  id,
  label: reward === 0 ? "No bonus" : `+${reward} Scrolls`,
  icon: reward === 0 ? "🍀" : reward >= 60 ? "💫" : "⚡",
  reward,
}));

export function statLabel(type: StatType) {
  return type === "power" ? "Power" : type === "strength" ? "Strength" : "Speed";
}

export function statIndex(type: StatType): 0 | 1 | 2 {
  return type === "power" ? 0 : type === "strength" ? 1 : 2;
}

/** Leaderboard formula (matches contract computeScore) */
export function explainLeaderboardScore(parts: {
  heroStatSum: number;
  streakDay: number;
  totalCheckIns: number;
  totalSpins: number;
  totalUpgrades: number;
  ecosystemBonus: number;
}) {
  const defenseTier = parts.streakDay * 5;
  const activity =
    parts.totalCheckIns + parts.totalSpins + parts.totalUpgrades;
  const total =
    parts.heroStatSum +
    defenseTier +
    activity +
    parts.ecosystemBonus;
  return { defenseTier, activity, total };
}
