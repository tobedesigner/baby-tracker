/*
  產生 PWA 圖示、分享預覽圖與 manifest，顏色與名字從 site.ts 與 babies.ts 長出來。
  npm run icons；產物進 git（public/icons/、public/og.png、public/manifest.webmanifest）。
  改了站名或代表色就重跑一次。
*/
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { BABIES } from "../src/data/babies.ts";
import { SITE } from "../src/data/site.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const ICONS = path.join(PUBLIC, "icons");
const BG = "#FFFFFF";

/** 最多畫兩個圓：雙寶各一個，疊在一起；一個寶寶就一個圓 */
const colors = BABIES.map((b) => b.accent)
  .filter((c) => /^#[0-9a-f]{6}$/i.test(c))
  .slice(0, 2);
if (!colors.length) colors.push(SITE.accent || "#8C7B6E");

function circles(cx: number, cy: number, R: number): string {
  if (colors.length === 1)
    return `<circle cx="${cx}" cy="${cy}" r="${R * 1.1}" fill="${colors[0]}"/>`;
  return (
    `<circle cx="${cx - R * 0.52}" cy="${cy}" r="${R}" fill="${colors[0]}" fill-opacity=".92"/>` +
    `<circle cx="${cx + R * 0.52}" cy="${cy}" r="${R}" fill="${colors[1]}" fill-opacity=".82"/>`
  );
}

/** 方形圖示。maskable 的安全區是中間 80%，圖要縮一點、背景填滿不留圓角 */
function icon(size: number, maskable: boolean): string {
  const r = maskable ? 0 : size * 0.22;
  const R = size * (maskable ? 0.19 : 0.23);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" rx="${r}" fill="${BG}"/>` +
    circles(size / 2, size / 2, R) +
    `</svg>`
  );
}

/** 分享預覽圖 1200×630：左邊兩個圓，右邊留白給 og:title 的文字（預覽卡會自己放標題） */
function og(): string {
  const W = 1200;
  const H = 630;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${BG}"/>` +
    circles(W / 2, H / 2, 150) +
    `<rect x="0" y="${H - 14}" width="${W}" height="14" fill="${SITE.accent || "#8C7B6E"}"/>` +
    `</svg>`
  );
}

async function png(svg: string, size: number | null, file: string): Promise<void> {
  const img = sharp(Buffer.from(svg));
  await (size ? img.resize(size, size) : img).png().toFile(file);
  console.log("✓", path.relative(ROOT, file));
}

await mkdir(ICONS, { recursive: true });
await png(icon(512, false), 192, path.join(ICONS, "icon-192.png"));
await png(icon(512, false), 512, path.join(ICONS, "icon-512.png"));
await png(icon(512, true), 512, path.join(ICONS, "icon-maskable-512.png"));
await png(icon(512, true), 180, path.join(ICONS, "apple-touch-icon.png"));
await png(og(), null, path.join(PUBLIC, "og.png"));

const manifest = {
  name: SITE.title || "成長里程碑",
  short_name: (SITE.title || "成長里程碑").slice(0, 12),
  description: SITE.subtitle || "",
  lang: "zh-Hant",
  start_url: "./",
  scope: "./",
  display: "standalone",
  background_color: BG,
  theme_color: SITE.accent || "#8C7B6E",
  icons: [
    { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
    {
      src: "icons/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};
await writeFile(
  path.join(PUBLIC, "manifest.webmanifest"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log("✓ public/manifest.webmanifest");
