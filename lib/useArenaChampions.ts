"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { DESTINY_HUB_ADDRESS, hubAbi, hubConfigured } from "@/lib/contracts";
import { HEROES, type Hero } from "@/lib/heroes";
import {
  arenaPowerRating,
  type ArenaChampion,
} from "@/lib/arenaCombat";

export type ArenaChampionCard = ArenaChampion & {
  hero: Hero;
  rating: number;
};

export function useArenaChampions() {
  const { address, isConnected } = useAccount();

  const { data: tokenIds, isLoading: loadingIds, refetch } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const ids = (tokenIds as bigint[] | undefined) ?? [];

  const { data: heroReads, isLoading: loadingHeroes } = useReadContracts({
    contracts: ids.map((id) => ({
      address: DESTINY_HUB_ADDRESS as `0x${string}`,
      abi: hubAbi,
      functionName: "getHero" as const,
      args: [id] as const,
    })),
    query: { enabled: hubConfigured && ids.length > 0 },
  });

  const champions = useMemo((): ArenaChampionCard[] => {
    if (!heroReads?.length) return [];

    return ids
      .map((tokenId, i) => {
        const row = heroReads[i]?.result as
          | { classId: number; power: number; strength: number; speed: number }
          | undefined;
        if (!row) return null;

        const classId = Number(row.classId);
        const hero = HEROES.find((h) => h.id === classId);
        if (!hero) return null;

        const stats = {
          power: Number(row.power),
          strength: Number(row.strength),
          speed: Number(row.speed),
        };

        return {
          tokenId,
          classId,
          ...stats,
          hero,
          rating: arenaPowerRating(stats),
        };
      })
      .filter((c): c is ArenaChampionCard => c !== null)
      .sort((a, b) => b.rating - a.rating);
  }, [heroReads, ids]);

  return {
    champions,
    championCount: champions.length,
    isLoading: loadingIds || (ids.length > 0 && loadingHeroes),
    isConnected,
    hubConfigured,
    refetch,
  };
}
