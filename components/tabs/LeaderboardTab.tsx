"use client";

import { useMemo, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  DESTINY_HUB_ADDRESS,
  hubAbi,
  hubConfigured,
} from "@/lib/contracts";
import { explainLeaderboardScore } from "@/lib/gameConstants";
import { DestinyWallet } from "@/components/DestinyWallet";
import {
  useWeeklyLeaderboard,
  shortAddr,
  medalForRank,
  tierClass,
  type WeeklyLeaderEntry,
} from "@/lib/useWeeklyLeaderboard";
import { useBasename } from "@/lib/useBasename";

function PlayerLabel({
  address,
  highlight,
  resolveName = false,
}: {
  address: string;
  highlight?: boolean;
  resolveName?: boolean;
}) {
  const { data: name } = useBasename(
    resolveName ? (address as `0x${string}`) : undefined,
  );
  const label =
    resolveName && typeof name === "string" && name.length > 0
      ? name.replace(/\.(base|basetest)\.eth$/, "")
      : shortAddr(address);

  return (
    <span className={`throne-player ${highlight ? "throne-player-you" : ""}`}>
      {label}
    </span>
  );
}

function PodiumCard({
  entry,
  slot,
}: {
  entry: WeeklyLeaderEntry;
  slot: 1 | 2 | 3;
}) {
  const { address: me } = useAccount();
  const isMe = me?.toLowerCase() === entry.address.toLowerCase();

  return (
    <div className={`throne-podium-slot throne-podium-${slot} ${tierClass(entry.rank)}`}>
      <div className="throne-podium-medal">{medalForRank(entry.rank)}</div>
      <div className="throne-podium-avatar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/art/logo${((entry.rank % 7) + 1)}.png`} alt="" />
      </div>
      <PlayerLabel address={entry.address} highlight={isMe} resolveName />
      <span className="throne-podium-score">{entry.score.toLocaleString()}</span>
      <span className="throne-podium-rank">#{entry.rank}</span>
    </div>
  );
}

function ListRow({ entry }: { entry: WeeklyLeaderEntry }) {
  const { address: me } = useAccount();
  const isMe = me?.toLowerCase() === entry.address.toLowerCase();

  return (
    <div className={`throne-row ${tierClass(entry.rank)} ${isMe ? "throne-row-you" : ""}`}>
      <span className="throne-row-rank">{entry.rank}</span>
      <PlayerLabel address={entry.address} highlight={isMe} resolveName={isMe} />
      <span className="throne-row-score">{entry.score.toLocaleString()} pts</span>
    </div>
  );
}

export function LeaderboardTab() {
  const { address, isConnected } = useAccount();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { data: board, isLoading, isError } = useWeeklyLeaderboard();

  const { data: player } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "getPlayer",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { data: weekly } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "getWeeklyScore",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { data: computeScore } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "computeScore",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { data: ecoBonus } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "ecosystemBonus",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const p = player as
    | {
        streakDay: bigint;
        totalCheckIns: bigint;
        totalSpins: bigint;
        totalUpgrades: bigint;
      }
    | undefined;

  const myScore = weekly
    ? Number((weekly as [bigint, bigint])[1])
    : computeScore
      ? Number(computeScore)
      : 0;

  const weekId = board?.weekId ?? (weekly ? Number((weekly as [bigint, bigint])[0]) : 0);

  const entries = useMemo(() => {
    const list = [...(board?.entries ?? [])];
    if (address && myScore > 0) {
      const idx = list.findIndex(
        (e) => e.address.toLowerCase() === address.toLowerCase(),
      );
      if (idx === -1) {
        list.push({ rank: 0, address, score: myScore });
        list.sort((a, b) => b.score - a.score);
        return list.map((e, i) => ({ ...e, rank: i + 1 }));
      }
      if (list[idx].score < myScore) {
        list[idx] = { ...list[idx], score: myScore };
        list.sort((a, b) => b.score - a.score);
        return list.map((e, i) => ({ ...e, rank: i + 1 }));
      }
    }
    return list;
  }, [board?.entries, address, myScore]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const myEntry = address
    ? entries.find((e) => e.address.toLowerCase() === address.toLowerCase())
    : undefined;

  const breakdown =
    p && computeScore !== undefined
      ? explainLeaderboardScore({
          heroStatSum:
            Number(computeScore) -
            Number(p.streakDay) * 5 -
            Number(p.totalCheckIns + p.totalSpins + p.totalUpgrades) -
            Number(ecoBonus ?? 0),
          streakDay: Number(p.streakDay),
          totalCheckIns: Number(p.totalCheckIns),
          totalSpins: Number(p.totalSpins),
          totalUpgrades: Number(p.totalUpgrades),
          ecosystemBonus: Number(ecoBonus ?? 0),
        })
      : null;

  return (
    <div className="screen throne-tab">
      <header className="throne-header cinematic-banner cinematic-banner--throne">
        <div className="cinematic-banner-shade" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/logo7.png" alt="" className="throne-crown" />
        <h1>The Throne</h1>
        <p className="throne-sub">Weekly War Rankings · DWAR airdrop points</p>
        <div className="throne-season-pill">
          Season Week <strong>#{weekId || "—"}</strong>
        </div>
      </header>

      {!hubConfigured ? (
        <p className="note throne-note">Deploy DestinyWarHub to enable the Throne.</p>
      ) : !isConnected ? (
        <div className="throne-connect card-panel">
          <p className="muted">Connect to see your rank and compete for the weekly crown.</p>
          <DestinyWallet variant="cta" disconnectedLabel="Connect Wallet" />
        </div>
      ) : (
        <>
          {myEntry && (
            <div className="throne-my-rank">
              <div className="throne-my-rank-inner">
                <span className="throne-my-label">Your Rank</span>
                <span className="throne-my-place">#{myEntry.rank}</span>
                <span className="throne-my-score">{myEntry.score.toLocaleString()} pts</span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="throne-loading card-panel">
              <p className="muted">Summoning champions from the chain…</p>
            </div>
          ) : isError || entries.length === 0 ? (
            <div className="throne-empty card-panel">
              <p className="throne-empty-title">The Throne awaits its first ruler</p>
              <p className="muted">
                Check in, upgrade heroes, and battle in the Arena to climb the weekly board.
                Your score: <strong>{myScore.toLocaleString()}</strong> pts
              </p>
            </div>
          ) : (
            <>
              {top3.length > 0 && (
                <section className="throne-podium-wrap">
                  <h2 className="throne-section-title">Top Champions</h2>
                  <div className="throne-podium">
                    {top3[1] && <PodiumCard entry={top3[1]} slot={2} />}
                    {top3[0] && <PodiumCard entry={top3[0]} slot={1} />}
                    {top3[2] && <PodiumCard entry={top3[2]} slot={3} />}
                  </div>
                </section>
              )}

              {rest.length > 0 && (
                <section className="throne-list-wrap card-panel">
                  <div className="throne-list-head">
                    <span>Rank</span>
                    <span>Champion</span>
                    <span>Points</span>
                  </div>
                  <div className="throne-list">
                    {rest.map((e) => (
                      <ListRow key={e.address} entry={e} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <section className="throne-breakdown card-panel">
            <button
              type="button"
              className="throne-breakdown-toggle"
              onClick={() => setShowBreakdown((v) => !v)}
            >
              <span>How scoring works</span>
              <span>{showBreakdown ? "▲" : "▼"}</span>
            </button>
            {showBreakdown && (
              <div className="throne-breakdown-body">
                <p className="throne-formula">
                  Score = Hero Stats + Defense Tier (streak × 5) + Activity + Ecosystem
                </p>
                {breakdown && (
                  <div className="throne-breakdown-grid">
                    <div className="throne-stat-chip">
                      <span>Hero stats</span>
                      <strong>
                        {breakdown.total -
                          breakdown.defenseTier -
                          breakdown.activity -
                          Number(ecoBonus ?? 0)}
                      </strong>
                    </div>
                    <div className="throne-stat-chip">
                      <span>Defense tier</span>
                      <strong>{breakdown.defenseTier}</strong>
                    </div>
                    <div className="throne-stat-chip">
                      <span>Activity</span>
                      <strong>{breakdown.activity}</strong>
                    </div>
                    <div className="throne-stat-chip">
                      <span>Ecosystem</span>
                      <strong>{Number(ecoBonus ?? 0)}</strong>
                    </div>
                  </div>
                )}
                <p className="muted throne-eco-note">
                  Top weekly ranks earn DWAR airdrop weight at TGE. Upgrade in Quest, fight in Arena.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
