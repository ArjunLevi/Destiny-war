"use client";

export type TabId =
  | "home"
  | "loop"
  | "battle"
  | "rank"
  | "airdrop"
  | "profile";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Realm", icon: "/art/logo.png" },
  { id: "loop", label: "Quest", icon: "/art/scrolls/weapon.png" },
  { id: "battle", label: "Arena", icon: "/art/logo2.png" },
  { id: "rank", label: "Throne", icon: "/art/logo7.png" },
  { id: "airdrop", label: "Treasury", icon: "/art/logo3.png" },
  { id: "profile", label: "Hero", icon: "/art/logo5.png" },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <nav className="bottom-nav bottom-nav-6" aria-label="Main navigation">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`nav-item ${active === t.id ? "active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.icon} alt="" className="nav-icon-img" />
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
