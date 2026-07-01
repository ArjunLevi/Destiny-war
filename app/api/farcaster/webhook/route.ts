import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    switch (event) {
      case "frame.added":
      case "frame.removed":
      case "notifications.enabled":
      case "notifications.disabled":
        console.log(`[farcaster] ${event}:`, data);
        break;
      default:
        console.log("[farcaster] unknown event:", event, data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[farcaster] webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
