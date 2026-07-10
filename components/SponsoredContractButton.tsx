"use client";

import { useEffect, type ReactNode } from "react";
import {
  useWriteContractWithBuilder,
  type WriteContractParams,
} from "@/lib/useWriteContractWithBuilder";

type SponsoredContractButtonProps = {
  params: WriteContractParams;
  className?: string;
  disabled?: boolean;
  busyLabel?: string;
  onSuccess?: () => void;
  children: ReactNode;
};

/** Sends txs; uses CDP Paymaster when billing is healthy, otherwise user-paid gas. */
export function SponsoredContractButton({
  params,
  className,
  disabled,
  busyLabel = "Confirming…",
  onSuccess,
  children,
}: SponsoredContractButtonProps) {
  const { writeContract, isConfirming, isSuccess, error } =
    useWriteContractWithBuilder();

  useEffect(() => {
    if (isSuccess) onSuccess?.();
  }, [isSuccess, onSuccess]);

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled || isConfirming}
        onClick={() => writeContract(params)}
      >
        {isConfirming ? busyLabel : children}
      </button>
      {error && (
        <p className="mint-err sponsored-action-err">
          {(error as { shortMessage?: string }).shortMessage ||
            error.message ||
            "Transaction failed"}
        </p>
      )}
    </>
  );
}
