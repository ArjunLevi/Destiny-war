/**
 * Generate Base App / Farcaster Mini App store assets.
 *
 * Specs (https://docs.base.org/mini-apps/features/manifest):
 *   iconUrl          1024×1024 PNG, no transparency
 *   heroImageUrl     1200×630 (1.91:1)
 *   ogImageUrl       1200×630
 *   splashImageUrl   200×200
 *   screenshotUrls   up to 3 × 1284×2778 portrait, max ~5 MB each
 *
 * Run: npm run generate:store
 */

import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ART = path.join(ROOT, "public", "art");
const OUT = path.join(ROOT, "public", "store");

const COLORS = {
  bg: "#0a1a14",
  bgDeep: "#061410",
  gold: "#d4af37",
  goldLight: "#ffe08a",
  muted: "#9cb8a8",
};

function svgTextOverlay({
  width,
  height,
  title,
  subtitle,
  badge,
}) {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#041018" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="#041018" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#041018" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#fade)"/>
  ${
    badge
      ? `<rect x="48" y="48" rx="20" ry="20" width="${badge.length * 14 + 48}" height="44" fill="rgba(212,175,55,0.18)" stroke="${COLORS.gold}" stroke-width="2"/>
  <text x="72" y="78" fill="${COLORS.goldLight}" font-family="Arial Black, Arial, sans-serif" font-size="22" font-weight="900">${esc(badge)}</text>`
      : ""
  }
  <text x="${width / 2}" y="${height - (subtitle ? 120 : 80)}" text-anchor="middle" fill="${COLORS.goldLight}" font-family="Arial Black, Arial, sans-serif" font-size="52" font-weight="900" letter-spacing="2">${esc(title)}</text>
  ${
    subtitle
      ? `<text x="${width / 2}" y="${height - 56}" text-anchor="middle" fill="${COLORS.muted}" font-family="Arial, sans-serif" font-size="28">${esc(subtitle)}</text>`
      : ""
  }
</svg>`);
}

function heroBannerSvg() {
  return Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#041018" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#041018" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffe08a"/>
      <stop offset="100%" stop-color="#d4af37"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#heroFade)"/>
  <text x="600" y="520" text-anchor="middle" fill="url(#goldText)" font-family="Arial Black, Arial, sans-serif" font-size="38" font-weight="900" letter-spacing="1">Seven Kingdoms. One War.</text>
  <text x="600" y="568" text-anchor="middle" fill="${COLORS.muted}" font-family="Arial, sans-serif" font-size="22">Mint · Quest · Arena · Earn on Base</text>
</svg>`);
}

async function resizeToBuffer(src, w, h, fit = "inside") {
  return sharp(src).resize(w, h, { fit, position: "centre" }).png().toBuffer();
}

async function coverBg(src, w, h) {
  return sharp(src).resize(w, h, { fit: "cover", position: "centre" }).png().toBuffer();
}

async function generateIcon() {
  const size = 1024;
  const pad = 72;
  const logo = await sharp(path.join(ART, "logo.png"))
    .resize(size - pad * 2, size - pad * 2, { fit: "inside" })
    .png()
    .toBuffer();
  const lm = await sharp(logo).metadata();
  const left = Math.round((size - lm.width) / 2);
  const top = Math.round((size - lm.height) / 2);

  const radial = Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="r" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stop-color="#143528"/>
        <stop offset="100%" stop-color="${COLORS.bgDeep}"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#r)"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="420" fill="none" stroke="${COLORS.gold}" stroke-opacity="0.22" stroke-width="4"/>
  </svg>`);

  await sharp(radial)
    .composite([{ input: logo, left, top }])
    .flatten({ background: COLORS.bgDeep })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, "icon-1024.png"));
}

async function generateSplash() {
  const size = 200;
  const logo = await sharp(path.join(ART, "logo.png"))
    .resize(160, 80, { fit: "inside" })
    .png()
    .toBuffer();
  const lm = await sharp(logo).metadata();
  await sharp({
    create: { width: size, height: size, channels: 3, background: COLORS.bg },
  })
    .composite([
      { input: logo, left: Math.round((size - lm.width) / 2), top: Math.round((size - lm.height) / 2) },
    ])
    .flatten({ background: COLORS.bg })
    .png()
    .toFile(path.join(OUT, "splash-200.png"));
}

async function generateHero() {
  const w = 1200;
  const h = 630;
  const bg = await sharp(path.join(ART, "bg3.png"))
    .resize(w, h, { fit: "cover", position: "left" })
    .png()
    .toBuffer();
  const logo = await resizeToBuffer(path.join(ART, "logo.png"), 380, 100);

  await sharp(bg)
    .composite([
      { input: logo, left: Math.round((w - 380) / 2), top: 36, blend: "over" },
      { input: heroBannerSvg(), left: 0, top: 0, blend: "over" },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT, "hero-1200x630.jpg"));

  // PNG copy for portals that prefer PNG (keep under 1 MB)
  await sharp(path.join(OUT, "hero-1200x630.jpg"))
    .png({ compressionLevel: 9, palette: true, quality: 85 })
    .toFile(path.join(OUT, "hero-1200x630.png"));
}

async function generateScreenshot({
  filename,
  bgSrc,
  contentSrc,
  badge,
  title,
  subtitle,
}) {
  const W = 1284;
  const H = 2778;
  const framePad = 52;
  const contentW = W - framePad * 2;

  const bg = await coverBg(bgSrc, W, H);
  const content = await sharp(contentSrc)
    .resize(contentW, Math.round(H * 0.62), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const cm = await sharp(content).metadata();
  const contentLeft = Math.round((W - cm.width) / 2);
  const contentTop = Math.round(H * 0.22);

  const frame = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${framePad - 4}" y="${contentTop - 4}" width="${cm.width + 8}" height="${cm.height + 8}" rx="28" fill="none" stroke="${COLORS.gold}" stroke-opacity="0.45" stroke-width="3"/>
  </svg>`);

  const overlay = svgTextOverlay({
    width: W,
    height: H,
    title,
    subtitle,
    badge,
  });

  await sharp(bg)
    .composite([
      { input: content, left: contentLeft, top: contentTop },
      { input: frame, left: 0, top: 0 },
      { input: overlay, left: 0, top: 0 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(OUT, filename.replace(".png", ".jpg")));

  await sharp(path.join(OUT, filename.replace(".png", ".jpg")))
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, filename));
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log("Generating store assets → public/store/");

  await sharp(path.join(ART, "bg3.png"))
    .resize(1920, 720, { fit: "cover" })
    .extract({ left: 0, top: 0, width: 1280, height: 720 })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(ART, "bg3-banner.jpg"));
  console.log("  ✓ bg3-banner.jpg (mobile banner crop)");

  await generateIcon();
  console.log("  ✓ icon-1024.png (1024×1024, opaque)");

  await generateSplash();
  console.log("  ✓ splash-200.png (200×200)");

  await generateHero();
  console.log("  ✓ hero-1200x630.png / .jpg (1.91:1 thumbnail)");

  await generateScreenshot({
    filename: "screenshot-1-realm.png",
    bgSrc: path.join(ART, "bg1.png"),
    contentSrc: path.join(ART, "kingdom3.png"),
    badge: "REALM",
    title: "Explore & Mint",
    subtitle: "Seven kingdoms · hero NFTs on Base",
  });
  console.log("  ✓ screenshot-1-realm.png (1284×2778)");

  await generateScreenshot({
    filename: "screenshot-2-quest.png",
    bgSrc: path.join(ART, "inventory-bg.png"),
    contentSrc: path.join(ART, "kingdom6.png"),
    badge: "QUEST",
    title: "Daily Scrolls",
    subtitle: "Check-in · wheel · hero upgrades",
  });
  console.log("  ✓ screenshot-2-quest.png (1284×2778)");

  await generateScreenshot({
    filename: "screenshot-3-arena.png",
    bgSrc: path.join(ART, "mapbg.jpg"),
    contentSrc: path.join(ART, "class3.png"),
    badge: "ARENA",
    title: "Enter the War",
    subtitle: "Cinematic battles · onchain leaderboard",
  });
  console.log("  ✓ screenshot-3-arena.png (1284×2778)");

  // Print sizes
  const { readdirSync, statSync } = await import("fs");
  for (const f of readdirSync(OUT).sort()) {
    const kb = (statSync(path.join(OUT, f)).size / 1024).toFixed(0);
    console.log(`     ${f} — ${kb} KB`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
