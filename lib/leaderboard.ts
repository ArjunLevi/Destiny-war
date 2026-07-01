import type { Abi } from "viem";

/**
 * Address of the deployed ArenaLeaderboard contract on Base mainnet.
 * Deploy `contracts/ArenaLeaderboard.sol` (see docs/SETUP.md), then set
 * NEXT_PUBLIC_LEADERBOARD_ADDRESS in .env.local. Until then the onchain
 * leaderboard UI stays in "not configured" mode and the game is fully playable.
 */
export const LEADERBOARD_ADDRESS = (process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS ||
  "") as `0x${string}` | "";

export const leaderboardConfigured =
  /^0x[a-fA-F0-9]{40}$/.test(LEADERBOARD_ADDRESS);

export const leaderboardAbi = [
  {
    type: "function",
    name: "submitScore",
    stateMutability: "nonpayable",
    inputs: [{ name: "wave", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "bestWave",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getAll",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "addrs", type: "address[]" },
      { name: "waves", type: "uint256[]" },
    ],
  },
  {
    type: "function",
    name: "playerCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "ScoreSubmitted",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "wave", type: "uint256", indexed: false },
      { name: "bestWave", type: "uint256", indexed: false },
    ],
  },
] as const satisfies Abi;
