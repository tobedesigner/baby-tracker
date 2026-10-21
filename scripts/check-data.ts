/*
  資料檢查：把網頁上會無聲吞掉的錯誤，在推上去前抓出來。
  npm run check 會跑；npm run build 與 GitHub Actions 也會先跑這支，有錯就不會發佈。
  直接用 Node 執行 .ts（Node 22.18 以上），不經過 Vite。
*/
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { BABIES } from "../src/data/babies.ts";
import { MILESTONES } from "../src/data/milestones.ts";
import { SITE } from "../src/data/site.ts";
import { thumbOf } from "../src/lib/asset.ts";
import { CATS, isCategoryKey } from "../src/lib/categories.ts";
import { parseDate } from "../src/lib/date.ts";
import type { MilestoneInput } from "../src/types.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const PHOTO_DIR = path.join(PUBLIC, "assets", "photos");

const errors: string[] = [];
const warns: string[] = [];

/** 「第 3 筆 2026-10-01「吐奶」」這種前綴，讓人一眼找到是哪一筆 */
function label(i: number, r: MilestoneInput): string {
  return `第 ${i + 1} 筆 ${r.date || "(無日期)"}「${r.title || "(無標題)"}」`;
}

function isExternal(p: string): boolean {
  return /^(https?:)?\/\//.test(p) || p.startsWith("data:");
}

/* ---------- 寶寶設定 ---------- */
const ids = new Set<string>();
BABIES.forEach((b, i) => {
  const who = b.name || b.id || `babies[${i}]`;
  if (!b.id) errors.push(`${who}：沒有 id`);
  else if (!/^[a-z0-9-]+$/.test(b.id))
    errors.push(`${who}：id「${b.id}」只能用小寫英數與 -，它會進網址`);
  else if (ids.has(b.id)) errors.push(`${who}：id「${b.id}」重複`);
  if (b.id) ids.add(b.id);
  if (!b.name) errors.push(`${who}：沒有 name`);
  if (b.birthday !== null && !parseDate(b.birthday)) {
    errors.push(`${who}：生日「${b.birthday}」格式不對或日期不存在`);
  }
  if (!/^#[0-9a-f]{6}$/i.test(b.accent)) {
    warns.push(`${who}：accent「${b.accent}」不是 #RRGGBB，會退回預設色`);
  }
});
if (SITE.defaultView !== "all" && !ids.has(SITE.defaultView)) {
  errors.push(`site.ts 的 defaultView「${SITE.defaultView}」不是寶寶 id，會退回「全部」`);
}

/* ---------- 里程碑 ---------- */
const today = new Date();
today.setHours(23, 59, 59, 999);
const seen = new Map<string, number>();
const usedPhotos = new Set<string>();

MILESTONES.forEach((r, i) => {
  const at = label(i, r);
  const date = parseDate(r.date);
  if (!date) errors.push(`${at}：date 缺了、格式不對或日期不存在，這筆不會顯示`);
  else if (date > today) warns.push(`${at}：日期在未來，確定不是打錯年份？`);

  if (!r.title || !String(r.title).trim()) errors.push(`${at}：title 缺了，這筆不會顯示`);

  if (r.endDate !== undefined) {
    const end = parseDate(r.endDate);
    if (!end) errors.push(`${at}：endDate「${r.endDate}」格式不對`);
    else if (date && end <= date)
      errors.push(`${at}：endDate 要晚於 date，結束日不能等於或早於開始日`);
  }

  if (r.category !== undefined && !isCategoryKey(r.category)) {
    errors.push(
      `${at}：category「${r.category}」不在分類表裡，可用：${Object.keys(CATS).join("、")}`,
    );
  }

  if (r.who !== undefined) {
    if (r.who.length === 0) {
      warns.push(`${at}：who 是空陣列，等於沒寫，會當全家共同；是的話直接不寫這個欄位`);
    }
    r.who.forEach((id) => {
      if (!ids.has(id))
        errors.push(`${at}：who 的「${id}」不是寶寶 id，可用：${[...ids].join("、")}`);
    });
  }

  if (r.measures) {
    if (!r.who || r.who.length !== 1)
      errors.push(`${at}：有 measures 就要一筆一人，who 只能寫一個`);
    const range: Record<string, [number, number, string]> = {
      height: [30, 130, "cm"],
      weight: [1, 40, "kg"],
      head: [25, 60, "cm"],
    };
    for (const [k, v] of Object.entries(r.measures)) {
      if (v === undefined) continue;
      if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) {
        errors.push(`${at}：measures.${k}「${v}」要是正數`);
      } else if (range[k] && (v < range[k][0] || v > range[k][1])) {
        warns.push(`${at}：measures.${k} = ${v} ${range[k][2]} 超出常見範圍，單位對嗎？`);
      }
    }
  }

  (r.photos ?? []).forEach((p) => {
    if (isExternal(p)) return;
    const rel = p.replace(/^\//, "");
    const file = path.join(PUBLIC, rel);
    if (!existsSync(file)) {
      errors.push(`${at}：照片 ${p} 不存在，找的是 public/${rel}，網頁上會直接隱藏`);
      return;
    }
    usedPhotos.add(path.resolve(file));
    if (!existsSync(path.join(PUBLIC, thumbOf(rel)))) {
      warns.push(
        `${at}：照片 ${p} 沒有縮圖，手機會下載整張大圖；原圖放進 photos/ 跑 npm run photos`,
      );
    }
  });

  if (date && r.title) {
    const key = `${r.date}|${String(r.title).trim()}|${(r.who ?? []).join(",")}`;
    const prev = seen.get(key);
    if (prev !== undefined)
      warns.push(`${at}：跟第 ${prev + 1} 筆同日、同標題、同人，是重複貼到嗎？`);
    seen.set(key, i);
  }
});

/* ---------- 沒被引用的照片 ---------- */
if (existsSync(PHOTO_DIR)) {
  readdirSync(PHOTO_DIR)
    .filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f) && !/\.thumb\.[a-z0-9]+$/i.test(f))
    .forEach((f) => {
      if (!usedPhotos.has(path.resolve(PHOTO_DIR, f))) {
        warns.push(`public/assets/photos/${f} 沒有任何里程碑引用，路徑打錯或忘了填 photos？`);
      }
    });
}

/* ---------- 輸出 ---------- */
errors.forEach((e) => console.log(`✗ ${e}`));
warns.forEach((w) => console.log(`△ ${w}`));
const summary = `${MILESTONES.length} 筆里程碑、${BABIES.length} 個寶寶`;
if (errors.length) {
  console.log(`\n資料檢查未通過：${errors.length} 個錯誤、${warns.length} 個提醒，${summary}`);
  process.exit(1);
}
console.log(`資料檢查通過，${warns.length ? `${warns.length} 個提醒` : "沒有問題"}，${summary}`);
