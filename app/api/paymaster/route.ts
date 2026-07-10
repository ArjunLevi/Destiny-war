import { NextRequest, NextResponse } from "next/server";
import { resolvePaymasterRpcUrl } from "@/lib/paymaster";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/** Lightweight status for debugging (no secrets). */
export async function GET() {
  const paymasterUrl = resolvePaymasterRpcUrl();
  if (!paymasterUrl) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: "Missing CDP_PAYMASTER_URL or CDP API key on the server.",
      },
      { status: 503, headers: corsHeaders },
    );
  }

  try {
    // Probe CDP with a known method. Empty params are invalid, but the
    // response still tells us if billing / auth / paymaster is healthy.
    const response = await fetch(paymasterUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "pm_getPaymasterStubData",
        params: [],
      }),
    });
    const data = (await response.json()) as {
      error?: { code?: number; message?: string };
      result?: unknown;
    };

    const message = data.error?.message ?? "";
    const billingBlocked =
      response.status === 402 ||
      /payment method/i.test(message) ||
      /payment required/i.test(message);

    if (billingBlocked) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          billingOk: false,
          error:
            "CDP Paymaster needs a payment method. Add one in portal.cdp.coinbase.com → Billing, then enable Paymaster on Base.",
          cdp: { status: response.status, message },
        },
        { status: 402, headers: corsHeaders },
      );
    }

    // Invalid params is expected for this probe — means auth + endpoint work.
    const authOk =
      response.ok ||
      /invalid/i.test(message) ||
      data.error?.code === -32602 ||
      data.error?.code === -32601;

    return NextResponse.json(
      {
        ok: authOk && !billingBlocked,
        configured: true,
        billingOk: !billingBlocked,
        cdp: {
          status: response.status,
          message: message || (data.result ? "ok" : "reachable"),
        },
      },
      { status: authOk ? 200 : response.status, headers: corsHeaders },
    );
  } catch (error) {
    console.error("Paymaster health check failed:", error);
    return NextResponse.json(
      { ok: false, configured: true, error: "Paymaster health check failed" },
      { status: 500, headers: corsHeaders },
    );
  }
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
    const method =
      typeof body === "object" && body && "method" in body
        ? String((body as { method?: string }).method)
        : "unknown";

    const response = await fetch(paymasterUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (data?.error) {
      console.error("CDP Paymaster error:", {
        method,
        status: response.status,
        code: data.error.code,
        message: data.error.message,
      });
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Paymaster proxy error:", error);
    return NextResponse.json(
      { error: "Paymaster proxy failed" },
      { status: 500, headers: corsHeaders },
    );
  }
}
