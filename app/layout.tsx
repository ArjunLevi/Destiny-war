import type { Metadata } from "next";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import { APP_ORIGIN } from "@/lib/appUrl";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(APP_ORIGIN),
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    icons: {
      icon: [
        { url: "/store/splash-200.png", sizes: "200x200", type: "image/png" },
        { url: "/store/icon-1024.png", sizes: "1024x1024", type: "image/png" },
      ],
      apple: "/store/icon-1024.png",
      shortcut: "/store/splash-200.png",
    },
    other: {
      // Base Developer Portal verification — https://dashboard.base.org
      "base:app_id": "6a44edbf2876ee6c1138a47c",
      // Rich embed so the app renders as a launchable card in Base App / Farcaster feeds.
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: `Launch ${minikitConfig.miniapp.name}`,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: "launch_miniapp",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
