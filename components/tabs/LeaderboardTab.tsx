"use client";

import { useAccount, useReadContract } from "wagmi";
import {
  Wallet,
  ConnectWallet,
} from "@coinbase/onchainkit/wallet";
import {
  DESTINY_HUB_ADDRESS,
  hubAbi,
  hubConfigured,
} from "@/lib/contracts";
import { explainLeaderboardScore } from "@/lib/gameConstants";

export function LeaderboardTab() {
  const { address, isConnected } = useAccount();

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

  const { data: tokenIds } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "tokensOfOwner",
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

  const weekScore = weekly
    ? Number((weekly as [bigint, bigint])[1])
    : computeScore
      ? Number(computeScore)
      : 0;

  return (
    <div className="screen rank-tab">
      <h1>Weekly Rank</h1>
      <p className="muted rank-formula">
        Score = Hero Stats (Pwr + Str + Spd) + Base Defense Tier (streak × 5) +
        Activity (check-ins + spins + upgrades) + Ecosystem Activity Points
      </p>

      {!hubConfigured ? (
        <p className="note">Deploy DestinyWarHub to enable leaderboard.</p>
      ) : !isConnected ? (
        <Wallet>
          <ConnectWallet className="btn" disconnectedLabel="Connect wallet" />
        </Wallet>
      ) : (
        <>
          <div className="rank-score card-panel">
            <p className="rank-week">Week #{weekly ? Number((weekly as [bigint, bigint])[0]) : "—"}</p>
            <p className="rank-total">{weekScore}</p>
            <p className="muted">Weekly giveaway points</p>
          </div>

          {breakdown && (
            <div className="rank-breakdown card-panel">
              <h2>Your breakdown</h2>
              <div className="rank-row">
                <span>Hero stats sum</span>
                <strong>{breakdown.total - breakdown.defenseTier - breakdown.activity - Number(ecoBonus ?? 0)}</strong>
              </div>
              <div className="rank-row">
                <span>Base defense tier</span>
                <strong>{breakdown.defenseTier}</strong>
              </div>
              <div className="rank-row">
                <span>Onchain activity</span>
                <strong>{breakdown.activity}</strong>
              </div>
              <div className="rank-row">
                <span>Ecosystem activity</span>
                <strong>{Number(ecoBonus ?? 0)}</strong>
              </div>
              <p className="muted rank-eco-note">
                Ecosystem points reflect Base network activity (Aerodrome, Base App,
                etc.) — updated weekly by the team until automated indexing ships.
              </p>
            </div>
          )}

          <div className="card-panel">
            <h2>Heroes owned</h2>
            <p>{((tokenIds as bigint[] | undefined)?.length ?? 0).toString()} NFT(s)</p>
            <p className="muted">
              Upgrade stats in Hero Loop · mint more on Home · every action = 1 tx on Base.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
