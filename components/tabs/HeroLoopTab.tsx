"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWatchContractEvent,
} from "wagmi";
import { DestinyWallet } from "@/components/DestinyWallet";
import { SponsoredContractButton } from "@/components/SponsoredContractButton";
import { useWriteContractWithBuilder } from "@/lib/useWriteContractWithBuilder";
import {
  DESTINY_HUB_ADDRESS,
  hubAbi,
  hubConfigured,
  spinOutcomeLabel,
  DAILY_ENERGY,
  DAYS_TO_MAX_HERO,
  SPIN_COST,
  STAT_MAX,
} from "@/lib/contracts";
import { STREAK7_ENERGY } from "@/lib/gameConstants";
import { HEROES } from "@/lib/heroes";
import { statIndex, type StatType } from "@/lib/gameConstants";
import { ScrollBadge } from "@/components/ScrollBadge";
import { ScrollWheel } from "@/components/ScrollWheel";
import { usePaymasterStatus } from "@/lib/usePaymasterStatus";

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
        <div
          className="stat-bar-fill"
          style={{ width: `${value}%` }}
        />
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
  const [pendingStat, setPendingStat] = useState<StatType | null>(null);
  const { writeContract, isConfirming, isSuccess, error } =
    useWriteContractWithBuilder();

  const { data: hero } = useReadContract({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    functionName: "getHero",
    args: [tokenId],
    query: { enabled: hubConfigured },
  });

  useEffect(() => {
    if (!isSuccess) return;
    onRefetch();
    setPendingStat(null);
  }, [isSuccess, onRefetch]);

  if (!hero) return null;

  const h = hero as {
    classId: number;
    power: number;
    strength: number;
    speed: number;
  };
  const meta = HEROES.find((x) => x.id === h.classId) ?? HEROES[0];
  const avgStat = Math.round((h.power + h.strength + h.speed) / 3);

  const stats: { key: StatType; val: number; label: string; short: string }[] = [
    { key: "power", val: h.power, label: "Power", short: "P" },
    { key: "strength", val: h.strength, label: "Strength", short: "S" },
    { key: "speed", val: h.speed, label: "Speed", short: "D" },
  ];

  const upgrade = (stat: StatType) => {
    setPendingStat(stat);
    writeContract({
      address: DESTINY_HUB_ADDRESS as `0x${string}`,
      abi: hubAbi,
      functionName: "upgradeStat",
      args: [tokenId, statIndex(stat)],
    });
  };

  return (
    <div className="hero-upgrade-card">
      <div className="hero-upgrade-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.portrait} alt={meta.name} className="hero-upgrade-portrait" />
        <span className="hero-upgrade-lvl">{avgStat}%</span>
      </div>
      <div className="hero-upgrade-body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.title} alt={meta.name} className="hero-upgrade-title" />
        <p className="hero-token-id">Champion #{tokenId.toString()}</p>
        {stats.map(({ key, val, label }) => (
          <StatBar key={key} label={label} value={val} />
        ))}
        <div className="upgrade-btns">
          {stats.map(({ key, val, label, short }) => {
            const busy = isConfirming && pendingStat === key;
            const disabled = val >= STAT_MAX || energy < 1 || isConfirming;
            return (
              <button
                key={key}
                type="button"
                className="btn secondary upgrade-stat-btn"
                disabled={disabled}
                title={`Upgrade ${label} (+1%)`}
                onClick={() => upgrade(key)}
              >
                {busy ? "…" : `+${short}`}
              </button>
            );
          })}
        </div>
        {error && pendingStat && (
          <p className="upgrade-err">
            {(error as { shortMessage?: string }).shortMessage || "Upgrade failed"}
          </p>
        )}
      </div>
    </div>
  );
}

function DailyCheckInBoard({
  streak,
  canCheckIn,
  nextReward,
  onSuccess,
}: {
  streak: number;
  canCheckIn: boolean;
  nextReward: number;
  onSuccess: () => void;
}) {
  const nextDay = canCheckIn ? streak + 1 : streak;

  return (
    <section className="quest-panel quest-checkin">
      <div className="quest-panel-head">
        <h2>Daily Check-in</h2>
        <span className="quest-panel-badge">{streak}/7 streak</span>
      </div>
      <p className="quest-panel-sub">
        Next reward: <strong>+{nextReward}</strong> scrolls
      </p>

      <div className="quest-day-row">
        {Array.from({ length: 7 }, (_, i) => {
          const day = i + 1;
          const reward = day === 7 ? STREAK7_ENERGY : DAILY_ENERGY;
          const done = streak >= day;
          const isNext = canCheckIn && day === nextDay;
          return (
            <div
              key={day}
              className={`quest-day-pill ${done ? "done" : ""} ${isNext ? "next" : ""}`}
            >
              <span className="quest-day-num">D{day}</span>
              <span className="quest-day-reward">+{reward}</span>
              {done && <span className="quest-day-check">✓</span>}
            </div>
          );
        })}
      </div>

      <SponsoredContractButton
        params={{
          address: DESTINY_HUB_ADDRESS as `0x${string}`,
          abi: hubAbi,
          functionName: "checkIn",
        }}
        className={`btn gold quest-checkin-btn ${canCheckIn ? "pulse" : ""}`}
        disabled={!canCheckIn}
        busyLabel="Checking in…"
        onSuccess={onSuccess}
      >
        {canCheckIn ? "Claim Daily Scrolls" : "Checked in today ✓"}
      </SponsoredContractButton>
    </section>
  );
}

export function HeroLoopTab() {
  const { address, isConnected } = useAccount();
  const { gasSponsored, isInMiniApp, billingOk } = usePaymasterStatus();
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const { writeContract, isConfirming: spinConfirming, error: spinError } =
    useWriteContractWithBuilder();

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

  useWatchContractEvent({
    address: DESTINY_HUB_ADDRESS as `0x${string}`,
    abi: hubAbi,
    eventName: "Spun",
    onLogs(logs) {
      const log = logs.find(
        (l) => l.args.player?.toLowerCase() === address?.toLowerCase(),
      );
      if (log?.args.outcome !== undefined) {
        setSpinResult(Number(log.args.outcome));
        setIsSpinning(false);
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

  const spin = () => {
    setSpinResult(null);
    setIsSpinning(true);
    writeContract({
      address: DESTINY_HUB_ADDRESS as `0x${string}`,
      abi: hubAbi,
      functionName: "spin",
    });
  };

  useEffect(() => {
    if (spinError) setIsSpinning(false);
  }, [spinError]);

  const p = player as PlayerData | undefined;
  const energy = p ? Number(p.energy) : 0;
  const streak = p ? Number(p.streakDay) : 0;
  const ids = (tokenIds as bigint[] | undefined) ?? [];

  if (!hubConfigured) {
    return (
      <div className="screen loop-tab">
        <h1>Quest</h1>
        <p className="note">
          Deploy <code>DestinyWarHub.sol</code> and set{" "}
          <code>NEXT_PUBLIC_DESTINY_HUB_ADDRESS</code> in <code>.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="screen loop-tab quest-tab">
      <header className="quest-header">
        <h1>Quest</h1>
        <p className="quest-tagline">
          Daily scrolls · wheel fortune · hero upgrades
        </p>
      </header>

      {!isConnected ? (
        <div className="quest-connect card-panel">
          <p className="muted">Connect to check in, spin, and upgrade champions.</p>
          <DestinyWallet variant="cta" disconnectedLabel="Connect to play" />
        </div>
      ) : (
        <>
          <div className="quest-dashboard card-panel">
            <ScrollBadge amount={energy} large />
            <div className="quest-dash-stats">
              <div className="quest-dash-stat">
                <span className="quest-dash-val">{streak}</span>
                <span className="quest-dash-lbl">Day streak</span>
              </div>
              <div className="quest-dash-stat">
                <span className="quest-dash-val">{ids.length}</span>
                <span className="quest-dash-lbl">Heroes</span>
              </div>
              <div className="quest-dash-stat">
                <span className="quest-dash-val">{Number(p?.totalSpins ?? 0n)}</span>
                <span className="quest-dash-lbl">Spins</span>
              </div>
            </div>
          </div>

          <DailyCheckInBoard
            streak={streak}
            canCheckIn={Boolean(canCheckIn)}
            nextReward={Number(nextReward ?? DAILY_ENERGY)}
            onSuccess={refetchPlayer}
          />

          <section className="quest-panel quest-wheel-panel">
            <div className="quest-panel-head">
              <h2>Scroll Wheel</h2>
              <span className="quest-panel-badge">{SPIN_COST} scrolls</span>
            </div>
            <p className="quest-panel-sub">Spin for bonus scrolls — best odds on +30</p>

            <ScrollWheel spinning={isSpinning} winnerId={spinResult} />

            <button
              type="button"
              className="btn gold quest-spin-btn"
              disabled={energy < SPIN_COST || isSpinning || spinConfirming}
              onClick={spin}
            >
              {isSpinning || spinConfirming
                ? "Spinning…"
                : `Spin Wheel (${SPIN_COST} scrolls)`}
            </button>

            {spinResult !== null && !isSpinning && (
              <p className="quest-spin-result">
                You won: {spinOutcomeLabel(spinResult)}
              </p>
            )}
          </section>

          <section className="quest-panel quest-upgrade-panel">
            <div className="quest-panel-head">
              <h2>Upgrade Heroes</h2>
              <span className="quest-panel-badge">1 scroll / +1%</span>
            </div>
            <p className="quest-panel-sub">
              Max one hero in <strong>{DAYS_TO_MAX_HERO} days</strong> · stats start at 10% · cap 100%
            </p>
            {ids.length === 0 ? (
              <p className="quest-empty-note">Mint champions on Realm first.</p>
            ) : (
              <>
                {energy < 1 && (
                  <p className="quest-empty-note">No scrolls left — check in daily or spin the wheel.</p>
                )}
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
              </>
            )}
          </section>

          {spinError && (
            <p className="mint-err">
              {(spinError as { shortMessage?: string }).shortMessage || "Tx failed"}
            </p>
          )}

          <p className="muted paymaster-hint">
            {billingOk === false
              ? "Paymaster credits pending — check-in works now with a small Base gas fee. Apply for gas credits in CDP Paymaster for $0 gas."
              : gasSponsored || isInMiniApp
                ? "Gas sponsored via Coinbase Paymaster — confirm should show $0 fees."
                : "Open inside Base App for $0 gas. External wallets pay small Base gas."}
          </p>
        </>
      )}
    </div>
  );
}
