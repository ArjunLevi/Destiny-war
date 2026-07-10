"use client";

import { useEffect, type ReactNode } from "react";
import {
  useWriteContractWithBuilder,
  type WriteContractParams,
} from "@/lib/useWriteContractWithBuilder";
import { usePaymasterStatus } from "@/lib/usePaymasterStatus";

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
  const { writeContract, isConfirming, isSuccess, error } =
    useWriteContractWithBuilder();
  const { billingOk, healthError } = usePaymasterStatus();

  useEffect(() => {
    if (isSuccess) onSuccess?.();
  }, [isSuccess, onSuccess]);

  const billingBlocked = billingOk === false;

  return (
    <div className="sponsored-action-wrap">
      <button
        type="button"
        className={className}
        disabled={disabled || isConfirming || billingBlocked}
        onClick={() => writeContract(params)}
        title={
          billingBlocked
            ? healthError ||
              "CDP Paymaster billing is not set — add a payment method in CDP Portal"
            : undefined
        }
      >
        {billingBlocked
          ? "Paymaster billing required"
          : isConfirming
            ? busyLabel
            : children}
      </button>
      {billingBlocked && (
        <p className="mint-err">
          {healthError ||
            "CDP Paymaster needs a payment method. Add one at portal.cdp.coinbase.com → Billing."}
        </p>
      )}
      {error && !billingBlocked && (
        <p className="mint-err">
          {(error as { shortMessage?: string }).shortMessage ||
            error.message ||
            "Transaction failed"}
        </p>
      )}
    </div>
  );
}
