import type { Abi } from "viem";
import {
  SPIN_OUTCOMES,
  DAILY_ENERGY,
  STREAK7_ENERGY,
  SPIN_COST,
  STAT_INITIAL,
  STAT_MAX,
  DAYS_TO_MAX_HERO,
  ENERGY_TO_MAX_HERO,
} from "@/lib/gameConstants";

export {
  SPIN_OUTCOMES,
  DAILY_ENERGY,
  STREAK7_ENERGY,
  SPIN_COST,
  STAT_INITIAL,
  STAT_MAX,
  DAYS_TO_MAX_HERO,
  ENERGY_TO_MAX_HERO,
};

export const USDC_ADDRESS =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const USDC_DECIMALS = 6;
export const MINT_PRICE_USDC = 0.01;

export const DESTINY_HUB_ADDRESS = (process.env
  .NEXT_PUBLIC_DESTINY_HUB_ADDRESS ||
  process.env.NEXT_PUBLIC_HERO_MINT_ADDRESS ||
  "") as `0x${string}` | "";

/** @deprecated use DESTINY_HUB_ADDRESS */
export const HERO_MINT_ADDRESS = DESTINY_HUB_ADDRESS;
/** @deprecated use DESTINY_HUB_ADDRESS */
export const DAILY_STRIKE_ADDRESS = DESTINY_HUB_ADDRESS;

export const hubConfigured = /^0x[a-fA-F0-9]{40}$/.test(DESTINY_HUB_ADDRESS);
export const heroMintConfigured = hubConfigured;
export const dailyStrikeConfigured = hubConfigured;

export const CLASS_NAMES = [
  "",
  "Fighter",
  "Swordsman",
  "Mage",
  "Ninja",
  "Priest",
  "Taoist",
  "Knight",
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const satisfies Abi;

export const hubAbi = [
  {
    type: "function",
    name: "mintHero",
    stateMutability: "nonpayable",
    inputs: [
      { name: "classId", type: "uint8" },
      { name: "quantity", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "checkIn",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "upgradeStat",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "statType", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "spin",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "canCheckIn",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "nextCheckInReward",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getPlayer",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "energy", type: "uint256" },
          { name: "lastCheckInDay", type: "uint256" },
          { name: "streakDay", type: "uint256" },
          { name: "totalCheckIns", type: "uint256" },
          { name: "totalSpins", type: "uint256" },
          { name: "totalUpgrades", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getHero",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "classId", type: "uint8" },
          { name: "power", type: "uint8" },
          { name: "strength", type: "uint8" },
          { name: "speed", type: "uint8" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "tokensOfOwner",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "heroClass",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "computeScore",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getWeeklyScore",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "weekId", type: "uint256" },
      { name: "score", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "ecosystemBonus",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "weeklyScores",
    stateMutability: "view",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "currentWeekId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalMinted",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "MINT_PRICE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "SPIN_COST",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "DAILY_ENERGY",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "HeroMinted",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "classId", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CheckedIn",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "streakDay", type: "uint256", indexed: false },
      { name: "reward", type: "uint256", indexed: false },
      { name: "energy", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "StatUpgraded",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "statType", type: "uint8", indexed: false },
      { name: "newValue", type: "uint8", indexed: false },
      { name: "energy", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Spun",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "outcome", type: "uint8", indexed: false },
      { name: "reward", type: "uint256", indexed: false },
      { name: "energy", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WeeklyScoreUpdated",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "weekId", type: "uint256", indexed: false },
      { name: "score", type: "uint256", indexed: false },
    ],
  },
] as const satisfies Abi;

/** Alias for mint cards */
export const heroMintAbi = hubAbi;
export const dailyStrikeAbi = hubAbi;

export function spinOutcomeLabel(outcome: number): string {
  const o = SPIN_OUTCOMES[outcome];
  return o ? o.label : "Spin";
}

/** @deprecated expedition map removed from Hero Loop v2 */
export const MAP_NODES = [
  { id: 0, label: "North Isle", top: "18%", left: "22%" },
  { id: 1, label: "East Cove", top: "28%", left: "72%" },
  { id: 2, label: "Skull Rock", top: "42%", left: "38%" },
  { id: 3, label: "West Bay", top: "48%", left: "78%" },
  { id: 4, label: "Central Peak", top: "58%", left: "48%" },
  { id: 5, label: "South Reef", top: "72%", left: "28%" },
] as const;

export const DAY_LOOP_TX_ESTIMATE = {
  checkIn: 1,
  spinsMax: 10,
  upgradesMax: 270,
  totalMax: 280,
} as const;
