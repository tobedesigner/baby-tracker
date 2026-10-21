/*
  照片處理：把 photos/ 裡的原圖縮成網頁用的 WebP 與縮圖，放進 public/assets/photos/。

  用法：原圖丟進 photos/，跑 npm run photos，照最後印出的提示把路徑貼進 milestones.ts。
  - 原圖不進 git（photos/ 在 .gitignore），網站只放縮過的版本
  - 輸出會去掉 EXIF（包含 GPS 位置），只套用轉正後的方向
  - 檔名沒有日期開頭的，用拍攝日期補上；讀不到拍攝日期就用檔案修改時間
  - 已處理過且原圖沒變的會跳過，可以重複執行
*/
import exifReader from "exif-reader";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "photos");
const OUT = path.join(ROOT, "public", "assets", "photos");
/** 長邊像素：大圖給 Lightbox，縮圖給卡片 */
const FULL = 1600;
const THUMB = 800;
const INPUT = /\.(jpe?g|png|webp|heic|heif|tiff?|avif|gif)$/i;

const pad2 = (n: number) => String(n).padStart(2, "0");
const kb = (n: number) => `${Math.round(n / 1024)} KB`;

/** EXIF 的時間沒有時區，exif-reader 會當成 UTC 建 Date，所以要用 UTC 的欄位取回原本的年月日 */
function ymdUtc(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}
function ymdLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

interface ExifTags {
  Photo?: Record<string, unknown>;
  Image?: Record<string, unknown>;
}

/** 從 EXIF 讀拍攝日期（YYYY-MM-DD）；讀不到回 null */
function takenDate(exif: Buffer | undefined): string | null {
  if (!exif) return null;
  try {
    const tags = exifReader(exif) as ExifTags;
    const d = tags.Photo?.DateTimeOriginal ?? tags.Photo?.DateTimeDigitized ?? tags.Image?.DateTime;
    return d instanceof Date && !isNaN(d.getTime()) ? ymdUtc(d) : null;
  } catch {
    return null;
  }
}

/** 輸出檔名：日期開頭 + 原檔名，小寫、空白換成 -、去掉會進不了網址的符號 */
function outName(file: string, date: string): string {
  const base = path.basename(file, path.extname(file));
  const clean = base
    .normalize("NFKC")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}._-]/gu, "")
    .toLowerCase();
  return /^\d{4}-\d{2}-\d{2}/.test(clean) ? clean : `${date}-${clean}`;
}

/** 輸出檔存在且比原圖新就不必重做 */
async function isFresh(out: string, srcMtime: Date): Promise<boolean> {
  try {
    return (await stat(out)).mtime >= srcMtime;
  } catch {
    return false;
  }
}

function resize(src: string, px: number, quality: number) {
  return sharp(src)
    .rotate() // 依 EXIF 方向轉正；之後不帶 EXIF 輸出，GPS 等資訊一併去掉
    .resize({ width: px, height: px, fit: "inside", withoutEnlargement: true })
    .webp({ quality });
}

async function main(): Promise<void> {
  let files: string[];
  try {
    files = (await readdir(SRC)).filter((f) => INPUT.test(f)).sort();
  } catch {
    console.log("找不到 photos/ 資料夾。在專案根目錄建一個 photos/，把原圖放進去再跑一次。");
    return;
  }
  if (!files.length) {
    console.log("photos/ 裡沒有圖片（支援 jpg、png、webp、heic、tiff、avif、gif）。");
    return;
  }
  await mkdir(OUT, { recursive: true });

  const done: { date: string; rel: string }[] = [];
  let failed = 0;

  for (const f of files) {
    const src = path.join(SRC, f);
    const st = await stat(src);

    let meta: Metadata;
    try {
      meta = await sharp(src).metadata();
    } catch (e) {
      const hint = /\.hei[cf]$/i.test(f)
        ? "。HEIC 這台解不開：iPhone 可在「設定 → 相機 → 格式」選「最相容」，或先匯出成 JPG"
        : "";
      console.log(`✗ ${f}：讀不了（${(e as Error).message}）${hint}`);
      failed += 1;
      continue;
    }

    const taken = takenDate(meta.exif);
    const date = taken ?? ymdLocal(st.mtime);
    const name = outName(f, date);
    const rel = `assets/photos/${name}.webp`;
    const full = path.join(OUT, `${name}.webp`);
    const thumb = path.join(OUT, `${name}.thumb.webp`);

    if ((await isFresh(full, st.mtime)) && (await isFresh(thumb, st.mtime))) {
      console.log(`－ ${f}：已處理過，略過`);
      done.push({ date, rel });
      continue;
    }

    const a = await resize(src, FULL, 82).toFile(full);
    const b = await resize(src, THUMB, 78).toFile(thumb);
    const when = taken ? `拍攝 ${taken}` : `讀不到拍攝日期，用檔案時間 ${date}`;
    console.log(
      `✓ ${f} → ${name}.webp（${when}，${meta.width}×${meta.height} → ${a.width}×${a.height}，${kb(a.size)}，縮圖 ${kb(b.size)}）`,
    );
    done.push({ date, rel });
  }

  if (done.length) {
    const byDate = new Map<string, string[]>();
    done.forEach((x) => byDate.set(x.date, [...(byDate.get(x.date) ?? []), x.rel]));
    console.log("\n貼進 milestones.ts 的寫法（同一天的已經合在一起）：");
    [...byDate.entries()].sort().forEach(([date, rels]) => {
      console.log(`  ${date}  photos: [${rels.map((r) => `"${r}"`).join(", ")}],`);
    });
  }
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
