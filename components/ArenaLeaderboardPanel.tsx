"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  LEADERBOARD_ADDRESS,
  leaderboardAbi,
  leaderboardConfigured,
} from "@/lib/leaderboard";

const short = (a: string) => `${a.slice(0, 5)}…${a.slice(-4)}`;

export function ArenaLeaderboardPanel() {
  const { address } = useAccount();

  const { data } = useReadContract({
    address: LEADERBOARD_ADDRESS as `0x${string}`,
    abi: leaderboardAbi,
    functionName: "getAll",
    query: { enabled: leaderboardConfigured },
  });

  const { data: myBest } = useReadContract({
    address: LEADERBOARD_ADDRESS as `0x${string}`,
    abi: leaderboardAbi,
    functionName: "bestWave",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(leaderboardConfigured && address) },
  });

  const rows = useMemo(() => {
    if (!data) return [];
    const [addrs, waves] = data as readonly [
      readonly `0x${string}`[],
      readonly bigint[],
    ];
    return addrs
      .map((addr, i) => ({ addr, wave: Number(waves[i]) }))
      .sort((a, b) => b.wave - a.wave);
  }, [data]);

  if (!leaderboardConfigured) {
    return (
      <section className="arena-lb-panel card-panel">
        <div className="arena-lb-head">
          <h2>Onchain Arena</h2>
          <span className="arena-lb-badge">Coming soon</span>
        </div>
        <p className="muted arena-lb-note">
          Deploy the arena leaderboard contract to rank waves globally on Base.
        </p>
      </section>
    );
  }

  const myRank = address
    ? rows.findIndex((r) => r.addr.toLowerCase() === address.toLowerCase())
    : -1;
  const myWave = myBest !== undefined ? Number(myBest as bigint) : 0;

  return (
    <section className="arena-lb-panel card-panel">
      <div className="arena-lb-head">
        <h2>Onchain Leaderboard</h2>
        <span className="arena-lb-badge">Base</span>
      </div>

      {address && myWave > 0 && (
        <p className="arena-lb-you">
          Your best: <strong>Wave {myWave}</strong>
          {myRank >= 0 ? ` · Rank #${myRank + 1}` : ""}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="muted arena-lb-note">No scores yet — be the first champion.</p>
      ) : (
        <ol className="arena-lb-list">
          {rows.slice(0, 5).map((r, i) => (
            <li
              key={r.addr}
              className={`arena-lb-row ${address && r.addr.toLowerCase() === address.toLowerCase() ? "me" : ""}`}
            >
              <span className="arena-lb-rank">#{i + 1}</span>
              <span className="arena-lb-addr">{short(r.addr)}</span>
              <span className="arena-lb-wave">Wave {r.wave}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
