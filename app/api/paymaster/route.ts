import { NextRequest, NextResponse } from "next/server";
import { resolvePaymasterRpcUrl } from "@/lib/paymaster";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const paymasterUrl = resolvePaymasterRpcUrl();
  if (!paymasterUrl) {
    return NextResponse.json(
      { error: "Paymaster not configured. Set CDP_PAYMASTER_URL on the server." },
      { status: 503, headers: corsHeaders },
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
    return NextResponse.json(data, { status: response.status, headers: corsHeaders });
  } catch (error) {
    console.error("Paymaster proxy error:", error);
    return NextResponse.json(
      { error: "Paymaster proxy failed" },
      { status: 500, headers: corsHeaders },
    );
  }
}
