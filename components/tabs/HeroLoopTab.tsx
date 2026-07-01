"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { useWriteContractWithBuilder } from "@/lib/useWriteContractWithBuilder";
import {
  Wallet,
  ConnectWallet,
} from "@coinbase/onchainkit/wallet";
import {
  DESTINY_HUB_ADDRESS,
  hubAbi,
  hubConfigured,
  SPIN_OUTCOMES,
  spinOutcomeLabel,
  DAILY_ENERGY,
  DAYS_TO_MAX_HERO,
  SPIN_COST,
  STAT_MAX,
} from "@/lib/contracts";
import { HEROES } from "@/lib/heroes";
import { statIndex, type StatType } from "@/lib/gameConstants";
import { ScrollBadge } from "@/components/ScrollBadge";

type PlayerData = {
  energy: bigint;
  streakDay: bigint;
  totalCheckIns: bigint;
  totalSpins: bigint;
  totalUpgrades: bigint;
};

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-bar-row">
      <span className="stat-bar-label">{label}</span>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="stat-bar-val">{value}%</span>
    </div>
  );
}

function HeroUpgradeCard({
  tokenId,
  energy,
  onRefetch,
}: {
  tokenId: bigint;
  energy: number;
  onRefetch: () => void;
}) {
  const { address } = useAccount();
  const { data: hero } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "getHero",
    args: [tokenId],
    query: { enabled: hubConfigured },
  });

  const { writeContract, data: hash, isPending } = useWriteContractWithBuilder();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) onRefetch();
  }, [isSuccess, onRefetch]);

  if (!hero) return null;

  const h = hero as {
    classId: number;
    power: number;
    strength: number;
    speed: number;
  };
  const meta = HEROES.find((x) => x.id === h.classId) ?? HEROES[0];
  const busy = isPending || confirming;

  const upgrade = (stat: StatType) => {
    if (!address || energy < 1) return;
    writeContract({
      address: DESTINY_HUB_ADDRESS as `0x${string}`,
      abi: hubAbi,
      functionName: "upgradeStat",
      args: [tokenId, statIndex(stat)],
    });
  };

  const stats: { key: StatType; val: number }[] = [
    { key: "power", val: h.power },
    { key: "strength", val: h.strength },
    { key: "speed", val: h.speed },
  ];

  return (
    <div className="hero-upgrade-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={meta.portrait} alt={meta.name} className="hero-upgrade-portrait" />
      <div className="hero-upgrade-body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.title} alt={meta.name} className="hero-upgrade-title" />
        <p className="muted hero-token-id">NFT #{tokenId.toString()}</p>
        <StatBar label="Power" value={h.power} />
        <StatBar label="Strength" value={h.strength} />
        <StatBar label="Speed" value={h.speed} />
        <div className="upgrade-btns">
          {stats.map(({ key, val }) => (
            <button
              key={key}
              type="button"
              className="btn secondary upgrade-stat-btn"
              disabled={busy || val >= STAT_MAX || energy < 1}
              onClick={() => upgrade(key)}
            >
              +{key[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroLoopTab() {
  const { address, isConnected } = useAccount();
  const [spinResult, setSpinResult] = useState<number | null>(null);

  const { data: player, refetch: refetchPlayer } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "getPlayer",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { data: canCheckIn } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "canCheckIn",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { data: nextReward } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "nextCheckInReward",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { data: tokenIds, refetch: refetchTokens } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && hubConfigured) },
  });

  const { writeContract, data: txHash, isPending, error: txError } =
    useWriteContractWithBuilder();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash });

  useWatchContractEvent({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    eventName: "Spun",
    onLogs(logs) {
      const log = logs.find(
        (l) =>
          l.args.player?.toLowerCase() === address?.toLowerCase()
      );
      if (log?.args.outcome !== undefined) {
        setSpinResult(Number(log.args.outcome));
      }
    },
  });

  useWatchContractEvent({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    eventName: "CheckedIn",
    onLogs() {
      refetchPlayer();
    },
  });

  const refetchAll = () => {
    refetchPlayer();
    refetchTokens();
  };

  const p = player as PlayerData | undefined;
  const energy = p ? Number(p.energy) : 0;
  const streak = p ? Number(p.streakDay) : 0;
  const busy = isPending || confirming;
  const ids = (tokenIds as bigint[] | undefined) ?? [];

  const checkIn = () =>
    writeContract({
      address: DESTINY_HUB_ADDRESS as `0x${string}`,
      abi: hubAbi,
      functionName: "checkIn",
    });

  const spin = () => {
    setSpinResult(null);
    writeContract({
      address: DESTINY_HUB_ADDRESS as `0x${string}`,
      abi: hubAbi,
      functionName: "spin",
    });
  };

  useEffect(() => {
    if (txHash && !confirming) refetchAll();
  }, [txHash, confirming]);

  const wheelSegments = useMemo(() => SPIN_OUTCOMES, []);

  if (!hubConfigured) {
    return (
      <div className="screen loop-tab">
        <h1>Hero Loop</h1>
        <p className="note">
          Deploy <code>DestinyWarHub.sol</code> and set{" "}
          <code>NEXT_PUBLIC_DESTINY_HUB_ADDRESS</code> in <code>.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="screen loop-tab">
      <h1>Hero Loop</h1>
      <p className="muted loop-intro">
        Check in daily for <strong>{DAILY_ENERGY} scrolls</strong>. Spend{" "}
        <strong>1 scroll</strong> per stat point — max one hero in{" "}
        <strong>{DAYS_TO_MAX_HERO} days</strong> (270 total). The wheel costs{" "}
        <strong>{SPIN_COST} scrolls</strong>.
      </p>

      {!isConnected ? (
        <Wallet>
          <ConnectWallet className="btn" disconnectedLabel="Connect to play" />
        </Wallet>
      ) : (
        <>
          <div className="loop-stats card-panel">
            <div className="loop-stat loop-stat-scrolls">
              <ScrollBadge amount={energy} large />
            </div>
            <div className="loop-stat">
              <span className="loop-stat-val">{streak}/7</span>
              <span className="loop-stat-lbl">Streak</span>
            </div>
            <div className="loop-stat">
              <span className="loop-stat-val">{ids.length}</span>
              <span className="loop-stat-lbl">Heroes</span>
            </div>
          </div>

          <section className="loop-section card-panel">
            <h2>Daily Check-in</h2>
            <p className="muted">
              Next reward: <strong>+{Number(nextReward ?? DAILY_ENERGY)}</strong> scrolls
            </p>
            <button
              type="button"
              className="btn gold"
              disabled={busy || !canCheckIn}
              onClick={checkIn}
            >
              {canCheckIn ? "Check In (1 tx)" : "Already checked in today"}
            </button>
          </section>

          <section className="loop-section card-panel">
            <h2>Scroll Wheel</h2>
            <p className="muted">Costs {SPIN_COST} scrolls · best odds on +30</p>
            <div className="spin-wheel-preview">
              {wheelSegments.map((s) => (
                <span key={s.id} className="spin-seg">
                  {s.icon} {s.reward}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="btn"
              disabled={busy || energy < SPIN_COST}
              onClick={spin}
            >
              Spin ({SPIN_COST} scrolls)
            </button>
            {spinResult !== null && (
              <p className="spin-result">
                Result: {spinOutcomeLabel(spinResult)}
              </p>
            )}
          </section>

          <section className="loop-section">
            <h2>Upgrade Heroes</h2>
            <p className="muted">Each +1 stat = 1 scroll · starts at 10% · max 100%</p>
            {ids.length === 0 ? (
              <p className="note">Mint heroes on the Home tab first.</p>
            ) : (
              <div className="hero-upgrade-list">
                {ids.map((id) => (
                  <HeroUpgradeCard
                    key={id.toString()}
                    tokenId={id}
                    energy={energy}
                    onRefetch={refetchAll}
                  />
                ))}
              </div>
            )}
          </section>

          {txError && (
            <p className="mint-err">
              {(txError as { shortMessage?: string }).shortMessage || "Tx failed"}
            </p>
          )}

          <p className="muted paymaster-hint">
            Gas sponsored via Coinbase Smart Wallet / Paymaster on Base when enabled.
          </p>
        </>
      )}
    </div>
  );
}
