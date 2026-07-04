"use client";

import { useCallback, useMemo } from "react";
import {
  useWriteContract,
  useSendCalls,
  useWaitForCallsStatus,
  useCapabilities,
  useChainId,
  useAccount,
} from "wagmi";
import { useIsInMiniApp } from "@coinbase/onchainkit/minikit";
import {
  concatHex,
  encodeFunctionData,
  type Abi,
  type Address,
  type Hex,
} from "viem";
import { base } from "viem/chains";
import { BUILDER_DATA_SUFFIX } from "@/lib/builderCode";
import { clientPaymasterEnabled, getClientPaymasterUrl } from "@/lib/paymaster";

type WriteContractParams = {
  address: Address;
  abi: Abi | readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
  chainId?: number;
};

function encodeCallData(params: WriteContractParams, sponsored: boolean): Hex {
  const callData = encodeFunctionData({
    abi: params.abi as Abi,
    functionName: params.functionName,
    args: params.args as readonly unknown[],
  });
  // Paymaster allowlists match raw function selectors — skip builder suffix when sponsoring.
  if (sponsored) return callData;
  return concatHex([callData, BUILDER_DATA_SUFFIX]);
}

function useShouldSponsor() {
  const chainId = useChainId();
  const targetChainId = chainId || base.id;
  const { connector } = useAccount();
  const { isInMiniApp } = useIsInMiniApp();
  const { data: capabilities } = useCapabilities({ chainId: targetChainId });

  return useMemo(() => {
    if (!clientPaymasterEnabled()) return false;

    const walletSupportsPaymaster =
      capabilities?.[targetChainId]?.paymasterService?.supported === true;

    const id = connector?.id?.toLowerCase() ?? "";
    const name = connector?.name?.toLowerCase() ?? "";
    const isCoinbaseWallet =
      id.includes("coinbase") ||
      id.includes("farcaster") ||
      name.includes("coinbase") ||
      name.includes("base");

    return walletSupportsPaymaster || isInMiniApp === true || isCoinbaseWallet;
  }, [capabilities, targetChainId, connector?.id, connector?.name, isInMiniApp]);
}

/** Writes hub/ERC20 txs; sponsors gas via CDP Paymaster on Base App / Smart Wallets. */
export function useWriteContractWithBuilder() {
  const chainId = useChainId();
  const targetChainId = chainId || base.id;
  const shouldSponsor = useShouldSponsor();

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
      if (shouldSponsor) {
        sendResult.sendCalls({
          calls: [
            {
              to: params.address,
              data: encodeCallData(params, true),
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
    [shouldSponsor, sendResult, targetChainId, writeResult],
  );

  const writeContractAsync = useCallback(
    async (params: WriteContractParams) => {
      if (shouldSponsor) {
        return sendResult.sendCallsAsync({
          calls: [
            {
              to: params.address,
              data: encodeCallData(params, true),
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
    [shouldSponsor, sendResult, targetChainId, writeResult],
  );

  return {
    ...writeResult,
    writeContract,
    writeContractAsync,
    data: hash,
    hash,
    isPending: writeResult.isPending || sendResult.isPending,
    error: writeResult.error ?? sendResult.error,
    paymasterSupported: shouldSponsor,
    callsId,
    callsStatus: callsStatus.data,
  };
}
