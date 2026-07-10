"use client";

import { useCallback, useMemo } from "react";
import {
  useWriteContract,
  useSendCalls,
  useWaitForCallsStatus,
  useWaitForTransactionReceipt,
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
import { usePaymasterStatus } from "@/lib/usePaymasterStatus";

export type WriteContractParams = {
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
  if (sponsored) return callData;
  return concatHex([callData, BUILDER_DATA_SUFFIX]);
}

function useShouldSponsor() {
  const chainId = useChainId();
  const targetChainId = chainId || base.id;
  const { connector } = useAccount();
  const { isInMiniApp } = useIsInMiniApp();
  const { data: capabilities } = useCapabilities({ chainId: targetChainId });
  const { billingOk } = usePaymasterStatus();

  return useMemo(() => {
    if (!clientPaymasterEnabled()) return false;
    // CDP returns 402 without billing/credits — fall back to user-paid gas.
    if (billingOk === false) return false;

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
  }, [
    capabilities,
    targetChainId,
    connector?.id,
    connector?.name,
    isInMiniApp,
    billingOk,
  ]);
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

  const { isLoading: confirmingReceipt, isSuccess: receiptSuccess } =
    useWaitForTransactionReceipt({ hash });

  const callsSuccess = callsStatus.data?.status === "success";
  const isConfirming =
    writeResult.isPending ||
    sendResult.isPending ||
    confirmingReceipt ||
    (Boolean(callsId) && callsStatus.isLoading);
  const isSuccess = receiptSuccess || callsSuccess;

  const sendSponsoredCalls = useCallback(
    (paramsList: WriteContractParams[]) => {
      sendResult.sendCalls({
        calls: paramsList.map((params) => ({
          to: params.address,
          data: encodeCallData(params, true),
          value: params.value ?? 0n,
        })),
        capabilities: {
          paymasterService: { url: getClientPaymasterUrl() },
        },
        chainId: paramsList[0]?.chainId ?? targetChainId,
      });
    },
    [sendResult, targetChainId],
  );

  const writeContract = useCallback(
    (params: WriteContractParams) => {
      if (shouldSponsor) {
        sendSponsoredCalls([params]);
        return;
      }

      writeResult.writeContract({
        ...params,
        dataSuffix: BUILDER_DATA_SUFFIX,
      } as Parameters<typeof writeResult.writeContract>[0]);
    },
    [shouldSponsor, sendSponsoredCalls, writeResult],
  );

  const writeContracts = useCallback(
    (paramsList: WriteContractParams[]) => {
      if (shouldSponsor) {
        sendSponsoredCalls(paramsList);
        return;
      }

      const first = paramsList[0];
      if (!first) return;
      writeResult.writeContract({
        ...first,
        dataSuffix: BUILDER_DATA_SUFFIX,
      } as Parameters<typeof writeResult.writeContract>[0]);
    },
    [shouldSponsor, sendSponsoredCalls, writeResult],
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
    writeContracts,
    writeContractAsync,
    data: hash,
    hash,
    isPending: writeResult.isPending || sendResult.isPending,
    isConfirming,
    isSuccess,
    error: writeResult.error ?? sendResult.error ?? callsStatus.error,
    paymasterSupported: shouldSponsor,
    callsId,
    callsStatus: callsStatus.data,
  };
}
