import { NextRequest, NextResponse } from "next/server";
import { resolvePaymasterRpcUrl } from "@/lib/paymaster";

export async function POST(request: NextRequest) {
  const paymasterUrl = resolvePaymasterRpcUrl();
  if (!paymasterUrl) {
    return NextResponse.json(
      { error: "Paymaster not configured. Set CDP_PAYMASTER_URL on the server." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const response = await fetch(paymasterUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Paymaster proxy error:", error);
    return NextResponse.json({ error: "Paymaster proxy failed" }, { status: 500 });
  }
}
