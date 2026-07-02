"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { resolveBasename } from "@/lib/basename";

export function useBasename(address?: Address) {
  return useQuery({
    queryKey: ["basename", address],
    queryFn: () => resolveBasename(address as Address),
    enabled: Boolean(address),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
