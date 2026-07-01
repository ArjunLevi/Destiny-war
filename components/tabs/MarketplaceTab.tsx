"use client";

export function MarketplaceTab() {
  return (
    <div className="screen market-tab">
      <h1>Marketplace</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/maintenance.gif"
        alt="Under maintenance"
        className="maintenance-gif"
      />
      <p className="market-soon">Coming soon</p>
      <p className="muted">
        Trade hero gear and items on the DWAR marketplace. Stay tuned.
      </p>
    </div>
  );
}
