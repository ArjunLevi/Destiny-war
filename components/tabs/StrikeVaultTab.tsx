"use client";

import { useEffect, useState } from "react";
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
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Address } from "@coinbase/onchainkit/identity";
import {
  DAILY_STRIKE_ADDRESS,
  dailyStrikeAbi,
  dailyStrikeConfigured,
  SPIN_OUTCOMES,
  spinOutcomeLabel,
} from "@/lib/contracts";

type PlayerData = {
  energy: bigint;
  lastCheckInDay: bigint;
  streakDay: bigint;
  totalCheckIns: bigint;
  totalSpins: bigint;
};

export function StrikeVaultTab() {
  const { address, isConnected } = useAccount();
  const [lastSpin, setLastSpin] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  const { data: playerRaw, refetch } = useReadContract({
    address: DAILY_STRIKE_ADDRESS as `0x${string}`,
    abi: dailyStrikeAbi,
    functionName: "getPlayer",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && dailyStrikeConfigured) },
  });

  const { data: canCheckIn } = useReadContract({
    address: DAILY_STRIKE_ADDRESS as `0x${string}`,
    abi: dailyStrikeAbi,
    functionName: "canCheckIn",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && dailyStrikeConfigured) },
  });

  const { data: nextReward } = useReadContract({
    address: DAILY_STRIKE_ADDRESS as `0x${string}`,
    abi: dailyStrikeAbi,
    functionName: "nextCheckInReward",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && dailyStrikeConfigured) },
  });

  const player = playerRaw as PlayerData | undefined;
  const energy = Number(player?.energy ?? 0n);
  const streak = Number(player?.streakDay ?? 0n);
  const canCheck = Boolean(canCheckIn);
  const rewardNext = Number(nextReward ?? 20n);

  const { writeContract, data: hash, isPending, error } = useWriteContractWithBuilder();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useWatchContractEvent({
    address: DAILY_STRIKE_ADDRESS as `0x${string}`,
    abi: dailyStrikeAbi,
    eventName: "Spun",
    onLogs(logs) {
      const mine = logs.find(
        (l) =>
          address &&
          l.args.player?.toLowerCase() === address.toLowerCase()
      );
      if (mine?.args.outcome !== undefined) {
        setLastSpin(Number(mine.args.outcome));
        setSpinning(false);
        refetch();
      }
    },
  });

  useWatchContractEvent({
    address: DAILY_STRIKE_ADDRESS as `0x${string}`,
    abi: dailyStrikeAbi,
    eventName: "CheckedIn",
    onLogs() {
      refetch();
    },
  });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  useEffect(() => {
    if (error) setSpinning(false);
  }, [error]);

  const checkIn = () =>
    writeContract({
      address: DAILY_STRIKE_ADDRESS as `0x${string}`,
      abi: dailyStrikeAbi,
      functionName: "checkIn",
    });

  const spin = () => {
    setSpinning(true);
    setLastSpin(null);
    writeContract({
      address: DAILY_STRIKE_ADDRESS as `0x${string}`,
      abi: dailyStrikeAbi,
      functionName: "spin",
    });
  };

  const busy = isPending || confirming;
  const canSpin = energy >= 30;

  return (
    <div className="screen strike-tab">
      <h1>Strike Vault</h1>
      <p className="muted">
        Daily onchain check-ins and energy spins. Every action signs a transaction
        on Base.
      </p>

      {!dailyStrikeConfigured ? (
        <p className="note">
          Deploy <code>DailyStrike.sol</code> and set{" "}
          <code>NEXT_PUBLIC_DAILY_STRIKE_ADDRESS</code>.
        </p>
      ) : !isConnected ? (
        <Wallet>
          <ConnectWallet className="btn" disconnectedLabel="Connect to play" />
          <WalletDropdown>
            <Identity hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      ) : (
        <>
          <div className="energy-display">
            <span className="energy-num">{energy}</span>
            <span className="energy-label">Energy</span>
          </div>

          <section className="card-panel">
            <h2>7-Day Check-In</h2>
            <div className="day-row">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div
                  key={d}
                  className={`day-pill ${streak >= d ? "done" : ""} ${streak + 1 === d && canCheck ? "next" : ""}`}
                >
                  <span className="day-num">D{d}</span>
                  <span className="day-reward">{d === 7 ? "+50" : "+20"}</span>
                </div>
              ))}
            </div>
            <button
              className="btn gold"
              onClick={checkIn}
              disabled={!canCheck || busy}
            >
              {busy
                ? "Signing…"
                : canCheck
                  ? `Check In (+${rewardNext} energy)`
                  : "Checked in today ✓"}
            </button>
          </section>

          <section className="card-panel">
            <h2>Energy Spin</h2>
            <p className="muted">Costs 30 energy per spin · sign tx to play</p>
            <div className={`spin-wheel ${spinning ? "spinning" : ""}`}>
              {SPIN_OUTCOMES.map((o) => (
                <div
                  key={o.id}
                  className={`spin-seg ${lastSpin === o.id ? "winner" : ""}`}
                >
                  <span>{o.icon}</span>
                  <span>{o.label}</span>
                </div>
              ))}
            </div>
            {lastSpin !== null && !spinning && (
              <p className="spin-result">
                Result: <strong>{spinOutcomeLabel(lastSpin)}</strong>
                {SPIN_OUTCOMES[lastSpin].reward > 0 &&
                  ` (+${SPIN_OUTCOMES[lastSpin].reward} energy)`}
              </p>
            )}
            <button
              className="btn"
              onClick={spin}
              disabled={!canSpin || busy}
            >
              {busy ? "Spinning…" : `Spin (−30 energy)`}
            </button>
          </section>
        </>
      )}

      {error && (
        <p className="note" style={{ color: "#ff9b9b" }}>
          {(error as { shortMessage?: string }).shortMessage || "Transaction failed"}
        </p>
      )}
    </div>
  );
}
