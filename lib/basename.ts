import {
  createPublicClient,
  encodePacked,
  http,
  keccak256,
  namehash,
  type Address,
} from "viem";
import { base, mainnet } from "viem/chains";
import { isBasename } from "@coinbase/onchainkit/identity";

const L2_RESOLVER = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD" as const;
const BASE_COIN_TYPE = BigInt((0x80000000 | base.id) >>> 0);

const l2ResolverAbi = [
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "addr",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "coinType", type: "uint256" },
    ],
    name: "addr",
    outputs: [{ type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

function reverseNode(address: Address) {
  const addressNode = keccak256(address.toLowerCase().slice(2) as Address);
  const coinType = ((0x80000000 | base.id) >>> 0).toString(16).toUpperCase();
  const baseReverseNode = namehash(`${coinType}.reverse`);
  return keccak256(
    encodePacked(["bytes32", "bytes32"], [baseReverseNode, addressNode]),
  );
}

function getBasePublicClient() {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
  const transport = apiKey
    ? http(`https://api.developer.coinbase.com/rpc/v1/base/${apiKey}`)
    : http("https://mainnet.base.org");
  return createPublicClient({ chain: base, transport });
}

function getMainnetPublicClient() {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
  const transport = apiKey
    ? http(`https://api.developer.coinbase.com/rpc/v1/ethereum/${apiKey}`)
    : http();
  return createPublicClient({ chain: mainnet, transport });
}

function bytesToAddress(bytes: `0x${string}`): Address | null {
  if (!bytes || bytes === "0x" || bytes.length < 42) return null;
  return `0x${bytes.slice(-40)}` as Address;
}

async function forwardAddressForName(name: string): Promise<Address | null> {
  const baseClient = getBasePublicClient();
  const node = namehash(name);

  try {
    const baseBytes = await baseClient.readContract({
      address: L2_RESOLVER,
      abi: l2ResolverAbi,
      functionName: "addr",
      args: [node, BASE_COIN_TYPE],
    });
    const fromBaseCoin = bytesToAddress(baseBytes as `0x${string}`);
    if (fromBaseCoin) return fromBaseCoin;
  } catch {
    // fall through
  }

  try {
    const ethAddr = await baseClient.readContract({
      address: L2_RESOLVER,
      abi: l2ResolverAbi,
      functionName: "addr",
      args: [node],
    });
    if (
      ethAddr &&
      ethAddr !== "0x0000000000000000000000000000000000000000"
    ) {
      return ethAddr as Address;
    }
  } catch {
    // fall through
  }

  try {
    const mainnetClient = getMainnetPublicClient();
    const ensAddr = await mainnetClient.getEnsAddress({ name });
    if (ensAddr) return ensAddr;
  } catch {
    // fall through
  }

  return null;
}

/** Resolve a wallet's primary Base name (.base.eth) on Base mainnet. */
export async function resolveBasename(
  address: Address,
): Promise<string | null> {
  const baseClient = getBasePublicClient();

  let reverseName = "";
  try {
    reverseName = await baseClient.readContract({
      address: L2_RESOLVER,
      abi: l2ResolverAbi,
      functionName: "name",
      args: [reverseNode(address)],
    });
  } catch {
    return null;
  }

  if (!reverseName || !isBasename(reverseName)) {
    return null;
  }

  const resolved = await forwardAddressForName(reverseName);
  if (
    resolved &&
    resolved.toLowerCase() === address.toLowerCase()
  ) {
    return reverseName;
  }

  // Reverse record is set; show it even if forward verify fails (RPC/CCIP issues).
  return reverseName;
}
