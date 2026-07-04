"use client";

import { useCallback, useMemo } from "react";
import {
  useWriteContract,
  useSendCalls,
  useWaitForCallsStatus,
  useCapabilities,
  useChainId,
} from "wagmi";
import {
  concatHex,
  encodeFunctionData,
  type Abi,
  type Address,
  type Hex,
} from "viem";
import { base } from "viem/chains";
import { BUILDER_DATA_SUFFIX } from "@/lib/builderCode";
import { getClientPaymasterUrl, paymasterEnabled } from "@/lib/paymaster";

type WriteContractParams = {
  address: Address;
  abi: Abi | readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
  chainId?: number;
};

function encodeCallData(params: WriteContractParams): Hex {
  return concatHex([
    encodeFunctionData({
      abi: params.abi as Abi,
      functionName: params.functionName,
      args: params.args as readonly unknown[],
    }),
    BUILDER_DATA_SUFFIX,
  ]);
}

/** Writes hub/ERC20 txs with builder attribution; sponsors gas via CDP Paymaster on Smart Wallets. */
export function useWriteContractWithBuilder() {
  const chainId = useChainId();
  const targetChainId = chainId || base.id;
  const { data: capabilities } = useCapabilities();

  const paymasterSupported = useMemo(() => {
    if (!paymasterEnabled) return false;
    return capabilities?.[targetChainId]?.paymasterService?.supported === true;
  }, [capabilities, targetChainId]);

  const writeResult = useWriteContract();
  const sendResult = useSendCalls();

  const callsId = sendResult.data?.id;
  const callsStatus = useWaitForCallsStatus({
    id: callsId,
    query: { enabled: Boolean(callsId) },
  });

  const sponsoredHash = callsStatus.data?.receipts?.[0]?.transactionHash;
  const hash = writeResult.data ?? sponsoredHash;

  const writeContract = useCallback(
    (params: WriteContractParams) => {
      if (paymasterSupported) {
        sendResult.sendCalls({
          calls: [
            {
              to: params.address,
              data: encodeCallData(params),
              value: params.value ?? 0n,
            },
          ],
          capabilities: {
            paymasterService: { url: getClientPaymasterUrl() },
          },
          chainId: params.chainId ?? targetChainId,
        });
        return;
      }

      writeResult.writeContract({
        ...params,
        dataSuffix: BUILDER_DATA_SUFFIX,
      } as Parameters<typeof writeResult.writeContract>[0]);
    },
    [paymasterSupported, sendResult, targetChainId, writeResult],
  );

  const writeContractAsync = useCallback(
    async (params: WriteContractParams) => {
      if (paymasterSupported) {
        return sendResult.sendCallsAsync({
          calls: [
            {
              to: params.address,
              data: encodeCallData(params),
              value: params.value ?? 0n,
            },
          ],
          capabilities: {
            paymasterService: { url: getClientPaymasterUrl() },
          },
          chainId: params.chainId ?? targetChainId,
        });
      }

      return writeResult.writeContractAsync({
        ...params,
        dataSuffix: BUILDER_DATA_SUFFIX,
      } as Parameters<typeof writeResult.writeContractAsync>[0]);
    },
    [paymasterSupported, sendResult, targetChainId, writeResult],
  );

  return {
    ...writeResult,
    writeContract,
    writeContractAsync,
    data: hash,
    hash,
    isPending: writeResult.isPending || sendResult.isPending,
    error: writeResult.error ?? sendResult.error,
    paymasterSupported,
    callsId,
    callsStatus: callsStatus.data,
  };
}
