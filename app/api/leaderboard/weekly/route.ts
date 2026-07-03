import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { DESTINY_HUB_ADDRESS, hubAbi, hubConfigured } from "@/lib/contracts";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const client = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL ?? undefined),
});

const weeklyScoreEvent = parseAbiItem(
  "event WeeklyScoreUpdated(address indexed player, uint256 weekId, uint256 score)",
);

export async function GET() {
  if (!hubConfigured) {
    return NextResponse.json({ weekId: 0, entries: [] });
  }

  try {
    const weekId = await client.readContract({
      address: DESTINY_HUB_ADDRESS as `0x${string}`,
      abi: hubAbi,
      functionName: "currentWeekId",
    });

    const fromBlock = BigInt(process.env.HUB_DEPLOY_FROM_BLOCK ?? "28000000");

    const logs = await client.getLogs({
      address: DESTINY_HUB_ADDRESS as `0x${string}`,
      event: weeklyScoreEvent,
      fromBlock,
      toBlock: "latest",
    });

    const best = new Map<string, bigint>();
    for (const log of logs) {
      const { player, weekId: w, score } = log.args;
      if (w !== weekId || !player || score === undefined) continue;
      const key = player.toLowerCase();
      const prev = best.get(key) ?? 0n;
      if (score > prev) best.set(key, score);
    }

    const entries = [...best.entries()]
      .map(([address, score]) => ({ address, score: Number(score) }))
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
      .map((e, i) => ({ rank: i + 1, ...e }));

    return NextResponse.json({
      weekId: Number(weekId),
      entries,
    });
  } catch {
    const weekId = await client
      .readContract({
        address: DESTINY_HUB_ADDRESS as `0x${string}`,
        abi: hubAbi,
        functionName: "currentWeekId",
      })
      .catch(() => 0n);

    return NextResponse.json({ weekId: Number(weekId), entries: [] });
  }
}
