/* 日期與年齡計算。全部是純函式，不碰 DOM。 */

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const DAY_MS = 86400000;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "2026-09-09" / "2026/9/9" → Date；格式不對回 null */
export function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d.getTime()) ? null : d;
}

/** 2026/09/09（三） */
export function fmtDate(d: Date): string {
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}（${WEEKDAYS[d.getDay()]}）`;
}

/** 2026/09/09 */
export function fmtShort(d: Date): string {
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}

/** 跨天的事：同年就只寫結束的月日，省得一長串 */
export function fmtRange(d: Date, e: Date | null): string {
  if (!e) return fmtDate(d);
  const year = d.getFullYear() === e.getFullYear() ? "" : `${e.getFullYear()}/`;
  const tail = `${year}${pad2(e.getMonth() + 1)}/${pad2(e.getDate())}（${WEEKDAYS[e.getDay()]}）`;
  return `${fmtDate(d)} ～ ${tail}`;
}

/** 跨天的事共幾天（含頭尾） */
export function spanDays(d: Date, e: Date): number {
  return Math.round((e.getTime() - d.getTime()) / DAY_MS) + 1;
}

export interface DateDiff {
  y: number;
  m: number;
  d: number;
  /** d 在 b 之前是 -1（出生前的紀錄） */
  sign: 1 | -1;
  /** 總月數，生長曲線的橫軸用 */
  months: number;
}

/** 從生日 b 到日期 d 的年月日差 */
export function diff(b: Date, d: Date): DateDiff {
  const sign: 1 | -1 = d < b ? -1 : 1;
  const a = sign > 0 ? b : d;
  const z = sign > 0 ? d : b;
  let y = z.getFullYear() - a.getFullYear();
  let m = z.getMonth() - a.getMonth();
  let day = z.getDate() - a.getDate();
  if (day < 0) {
    m -= 1;
    day += new Date(z.getFullYear(), z.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y -= 1;
    m += 12;
  }
  return { y, m, d: day, sign, months: y * 12 + m };
}

/** 「7 個月又 3 天」「1 歲 2 個月」「出生前 12 天」 */
export function ageText(b: Date | null, d: Date): string {
  if (!b) return "";
  const t = diff(b, d);
  if (t.sign < 0) return `出生前 ${Math.round((b.getTime() - d.getTime()) / DAY_MS)} 天`;
  if (t.y === 0 && t.m === 0 && t.d === 0) return "出生當天";
  if (t.y === 0 && t.m === 0) return `出生 ${t.d} 天`;
  if (t.y === 0) return `${t.m} 個月${t.d ? `又 ${t.d} 天` : ""}`;
  return `${t.y} 歲${t.m ? ` ${t.m} 個月` : ""}`;
}

/** 今天的零點，用來算「現在幾歲」 */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
