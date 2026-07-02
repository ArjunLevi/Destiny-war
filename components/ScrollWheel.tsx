"use client";

import { SPIN_OUTCOMES } from "@/lib/gameConstants";

export function ScrollWheel({
  spinning,
  winnerId,
}: {
  spinning: boolean;
  winnerId: number | null;
}) {
  return (
    <div className="quest-wheel-wrap">
      <div className="quest-wheel-pointer" aria-hidden>
        ▼
      </div>
      <div
        className={`quest-wheel ${spinning ? "is-spinning" : ""} ${winnerId !== null && !spinning ? "revealed" : ""}`}
      >
        {SPIN_OUTCOMES.map((seg, i) => (
          <div
            key={seg.id}
            className={`quest-wheel-seg ${winnerId === seg.id ? "winner" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className="quest-wheel-seg-label">
              <span className="quest-wheel-icon">{seg.icon}</span>
              <span className="quest-wheel-reward">
                {seg.reward === 0 ? "0" : `+${seg.reward}`}
              </span>
            </span>
          </div>
        ))}
        <div className="quest-wheel-hub" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/scrolls/weapon.png" alt="" />
        </div>
      </div>
    </div>
  );
}
