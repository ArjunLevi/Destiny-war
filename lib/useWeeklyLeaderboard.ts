"use client";

import { useQuery } from "@tanstack/react-query";

export type WeeklyLeaderEntry = {
  rank: number;
  address: string;
  score: number;
};

export type WeeklyLeaderboard = {
  weekId: number;
  entries: WeeklyLeaderEntry[];
};

export function useWeeklyLeaderboard() {
  return useQuery({
    queryKey: ["weekly-leaderboard"],
    queryFn: async (): Promise<WeeklyLeaderboard> => {
      const res = await fetch("/api/leaderboard/weekly");
      if (!res.ok) throw new Error("Leaderboard fetch failed");
      return res.json();
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function medalForRank(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

export function tierClass(rank: number) {
  if (rank === 1) return "throne-tier-gold";
  if (rank === 2) return "throne-tier-silver";
  if (rank === 3) return "throne-tier-bronze";
  if (rank <= 10) return "throne-tier-elite";
  return "";
}
