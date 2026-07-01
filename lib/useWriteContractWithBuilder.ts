"use client";

import { useCallback } from "react";
import { useWriteContract } from "wagmi";
import { BUILDER_DATA_SUFFIX } from "@/lib/builderCode";

/** Like useWriteContract, but appends your Base builder code to every tx. */
export function useWriteContractWithBuilder(
  ...args: Parameters<typeof useWriteContract>
) {
  const result = useWriteContract(...args);

  const writeContract = useCallback(
    ((variables, options) =>
      result.writeContract(
        { ...variables, dataSuffix: BUILDER_DATA_SUFFIX },
        options,
      )) as typeof result.writeContract,
    [result.writeContract],
  );

  const writeContractAsync = useCallback(
    ((variables, options) =>
      result.writeContractAsync(
        { ...variables, dataSuffix: BUILDER_DATA_SUFFIX },
        options,
      )) as typeof result.writeContractAsync,
    [result.writeContractAsync],
  );

  return { ...result, writeContract, writeContractAsync };
}
