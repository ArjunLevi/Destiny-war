"use client";

import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { APP_ICON_URL, APP_ORIGIN } from "@/lib/appUrl";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "dark",
          name: "DestinyWar",
          logo: APP_ICON_URL,
        },
        wallet: { display: "modal", preference: "all" },
        paymaster: `${APP_ORIGIN}/api/paymaster`,
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
