"use client";

import { useEffect, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Address } from "@coinbase/onchainkit/identity";
import {
  LEADERBOARD_ADDRESS,
  leaderboardAbi,
  leaderboardConfigured,
} from "@/lib/leaderboard";

const short = (a: string) => `${a.slice(0, 5)}…${a.slice(-4)}`;

export function Leaderboard({
  wave,
  onShare,
}: {
  wave: number;
  onShare: () => void;
}) {
  const { address, isConnected } = useAccount();

  const { data, refetch } = useReadContract({
    address: LEADERBOARD_ADDRESS as `0x${string}`,
    abi: leaderboardAbi,
    functionName: "getAll",
    query: { enabled: leaderboardConfigured },
  });

  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (confirmed) refetch();
  }, [confirmed, refetch]);

  const rows = useMemo(() => {
    if (!data) return [];
    const [addrs, waves] = data as readonly [
      readonly `0x${string}`[],
      readonly bigint[],
    ];
    return addrs
      .map((a, i) => ({ addr: a, wave: Number(waves[i]) }))
      .sort((a, b) => b.wave - a.wave);
  }, [data]);

  const myRank = address
    ? rows.findIndex((r) => r.addr.toLowerCase() === address.toLowerCase())
    : -1;

  const submit = () =>
    writeContract({
      address: LEADERBOARD_ADDRESS as `0x${string}`,
      abi: leaderboardAbi,
      functionName: "submitScore",
      args: [BigInt(wave)],
    });

  if (!leaderboardConfigured) {
    return (
      <div className="stack">
        <button className="btn gold" onClick={onShare}>
          Share my run
        </button>
        <p className="note">
          Onchain leaderboard not set up yet. Deploy the leaderboard contract and
          set NEXT_PUBLIC_LEADERBOARD_ADDRESS (see docs/SETUP.md) to enable global
          ranking and onchain scores.
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      {rows.length > 0 && (
        <div className="lb">
          <h3>Top Champions</h3>
          {rows.slice(0, 5).map((r, i) => (
            <div
              key={r.addr}
              className={`lb-row ${address && r.addr.toLowerCase() === address.toLowerCase() ? "me" : ""}`}
            >
              <span>
                {i + 1}. {short(r.addr)}
              </span>
              <span>Wave {r.wave}</span>
            </div>
          ))}
          {myRank >= 5 && address && (
            <div className="lb-row me">
              <span>
                {myRank + 1}. {short(address)}
              </span>
              <span>Wave {rows[myRank].wave}</span>
            </div>
          )}
        </div>
      )}

      {!isConnected ? (
        <Wallet>
          <ConnectWallet className="btn" disconnectedLabel="Connect to save score" />
          <WalletDropdown>
            <Identity hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      ) : confirmed ? (
        <button className="btn" disabled>
          Score saved onchain ✓
        </button>
      ) : (
        <button className="btn" onClick={submit} disabled={isPending || confirming}>
          {isPending || confirming ? "Saving onchain…" : `Save Wave ${wave} onchain`}
        </button>
      )}

      <button className="btn gold" onClick={onShare}>
        Share my run
      </button>

      {error && (
        <p className="note" style={{ color: "#ff9b9b" }}>
          {(error as { shortMessage?: string }).shortMessage || "Transaction failed"}
        </p>
      )}
    </div>
  );
}
