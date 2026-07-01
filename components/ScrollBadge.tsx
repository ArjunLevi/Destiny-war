"use client";

export const SCROLL_ICON = "/art/scrolls/weapon.png";

export function ScrollIcon({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SCROLL_ICON}
      alt=""
      className="scroll-icon"
      width={size}
      height={size}
    />
  );
}

export function ScrollBadge({
  amount,
  label = "Scrolls",
  large,
}: {
  amount: number | string;
  label?: string;
  large?: boolean;
}) {
  return (
    <div className={`scroll-badge ${large ? "large" : ""}`}>
      <ScrollIcon size={large ? 36 : 28} />
      <div className="scroll-badge-text">
        <span className="scroll-badge-val">{amount}</span>
        <span className="scroll-badge-lbl">{label}</span>
      </div>
    </div>
  );
}
