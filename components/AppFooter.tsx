"use client";

const SOCIAL = {
  x: "#",
  discord: "#",
} as const;

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-social">
        <a
          href={SOCIAL.x}
          className="footer-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Destiny War on X"
        >
          <span className="footer-icon" aria-hidden>
            𝕏
          </span>
          <span>X</span>
        </a>
        <a
          href={SOCIAL.discord}
          className="footer-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Destiny War Discord"
        >
          <span className="footer-icon" aria-hidden>
            ◆
          </span>
          <span>Discord</span>
        </a>
      </div>
      <p className="footer-copy">
        Copyright {year} © All rights reserved. Destiny War Inc.
      </p>
    </footer>
  );
}
