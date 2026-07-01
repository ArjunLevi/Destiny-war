"use client";

import { useCallback } from "react";
import { useWriteContract } from "wagmi";
import { BUILDER_DATA_SUFFIX } from "@/lib/builderCode";

/** Like useWriteContract, but appends your Base builder code to every tx. */
export function useWriteContractWithBuilder(
  ...args: Parameters<typeof useWriteContract>
) {
  const result = useWriteContract(...args);

  const writeContract = useCallback<typeof result.writeContract>(
    (variables, options) =>
      result.writeContract(
        { ...variables, dataSuffix: BUILDER_DATA_SUFFIX },
        options,
      ),
    [result.writeContract],
  );

  const writeContractAsync = useCallback<typeof result.writeContractAsync>(
    (variables, options) =>
      result.writeContractAsync(
        { ...variables, dataSuffix: BUILDER_DATA_SUFFIX },
        options,
      ),
    [result.writeContractAsync],
  );

  return { ...result, writeContract, writeContractAsync };
}
