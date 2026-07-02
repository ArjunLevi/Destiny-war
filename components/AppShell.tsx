"use client";

import { useState } from "react";
import { BottomNav, TabId } from "@/components/BottomNav";
import { HomeTab } from "@/components/tabs/HomeTab";
import { HeroLoopTab } from "@/components/tabs/HeroLoopTab";
import { LeaderboardTab } from "@/components/tabs/LeaderboardTab";
import { AirdropTab } from "@/components/tabs/AirdropTab";
import { ArenaTab } from "@/components/tabs/ArenaTab";
import { ProfileTab } from "@/components/tabs/ProfileTab";
import { NetworkBanner } from "@/components/NetworkBanner";

export function AppShell() {
  const [tab, setTab] = useState<TabId>("home");

  return (
    <div className="app-shell">
      <NetworkBanner />
      <div
        className={`tab-content ${tab === "home" ? "home-bg" : tab === "airdrop" ? "treasury-bg" : tab === "battle" ? "arena-bg" : "page-bg"}`}
      >
        {tab === "home" && <HomeTab onLoop={() => setTab("loop")} />}
        {tab === "loop" && <HeroLoopTab />}
        {tab === "battle" && <ArenaTab />}
        {tab === "rank" && <LeaderboardTab />}
        {tab === "airdrop" && <AirdropTab />}
        {tab === "profile" && <ProfileTab />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
