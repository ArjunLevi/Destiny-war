"use client";

import { useState } from "react";
import { KINGDOMS, Kingdom } from "@/lib/lore";

function KingdomModal({
  kingdom,
  onClose,
}: {
  kingdom: Kingdom;
  onClose: () => void;
}) {
  return (
    <div className="kingdom-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="kingdom-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`kingdom-title-${kingdom.id}`}
      >
        <button type="button" className="kingdom-close" onClick={onClose}>
          ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={kingdom.banner}
          alt={`${kingdom.realm} banner`}
          className="kingdom-banner"
        />
        <div className="kingdom-modal-body">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={kingdom.title} alt={kingdom.name} className="kingdom-title" />
          <p className="kingdom-realm">{kingdom.realm}</p>
          <p className="kingdom-lore">{kingdom.lore}</p>
        </div>
      </div>
    </div>
  );
}

export function KingdomMap() {
  const [selected, setSelected] = useState<Kingdom | null>(null);

  return (
    <section className="kingdom-section">
      <div className="kingdom-header">
        <h2>Battle Map</h2>
        <p className="muted">
          Tap a kingdom sigil to learn its history. Seven realms. One war.
        </p>
      </div>

      <div className="kingdom-map">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/mapbg.jpg" alt="Expedition battle map" className="map-img" />
        {KINGDOMS.map((k) => (
          <button
            key={k.id}
            type="button"
            className="kingdom-pin"
            style={{ top: k.top, left: k.left }}
            onClick={() => setSelected(k)}
            aria-label={`Open ${k.realm}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={k.logo} alt="" className="kingdom-logo" />
          </button>
        ))}
      </div>

      {selected && (
        <KingdomModal kingdom={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
