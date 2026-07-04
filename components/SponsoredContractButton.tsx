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

/** Regular button that sends gas-sponsored calls via CDP Paymaster when supported. */
export function SponsoredContractButton({
  params,
  className,
  disabled,
  busyLabel = "Confirming…",
  onSuccess,
  children,
}: SponsoredContractButtonProps) {
  const { writeContract, isConfirming, isSuccess } = useWriteContractWithBuilder();

  useEffect(() => {
    if (isSuccess) onSuccess?.();
  }, [isSuccess, onSuccess]);

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || isConfirming}
      onClick={() => writeContract(params)}
    >
      {isConfirming ? busyLabel : children}
    </button>
  );
}
