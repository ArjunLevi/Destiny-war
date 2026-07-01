import { privateKeyToAccount } from "viem/accounts";
import { encodePacked, keccak256 } from "viem";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Returns a signed voucher for spinWithVoucher() after x402 or manual paid flow.
 * Set SPIN_VOUCHER_PRIVATE_KEY — must match DailyStrike.voucherSigner onchain.
 */
export async function POST(req: NextRequest) {
  const key = process.env.SPIN_VOUCHER_PRIVATE_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "SPIN_VOUCHER_PRIVATE_KEY not configured" },
      { status: 503 }
    );
  }

  let body: { address?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const address = body.address?.toLowerCase();
  if (!address || !/^0x[a-f0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const chainId = BigInt(process.env.NEXT_PUBLIC_CHAIN_ID || "8453");
  const contract = process.env.NEXT_PUBLIC_DAILY_STRIKE_ADDRESS as
    | `0x${string}`
    | undefined;
  if (!contract || !/^0x[a-fA-F0-9]{40}$/.test(contract)) {
    return NextResponse.json({ error: "Contract not configured" }, { status: 503 });
  }

  const nonce = BigInt(Date.now());
  const account = privateKeyToAccount(key as `0x${string}`);

  const hash = keccak256(
    encodePacked(
      ["address", "uint256", "uint256", "address"],
      [address as `0x${string}`, nonce, chainId, contract]
    )
  );

  const signature = await account.signMessage({ message: { raw: hash } });

  return NextResponse.json({
    nonce: nonce.toString(),
    signature,
    contract,
  });
}
