/* 日期與年齡計算。全部是純函式，不碰 DOM。 */

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const DAY_MS = 86400000;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "2026-09-09" / "2026/9/9" → Date；格式不對或日期不存在（2 月 30 日）回 null */
export function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = String(s)
    .trim()
    .match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (!m) return null;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const date = new Date(y, mo - 1, d);
  // new Date 會把 2/30 悄悄換算成 3/2，要把各欄位比對回去才抓得到
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
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

/** 從 b 往後推 n 個月；月底不存在的日子取該月最後一天（1/31 推一個月是 2/28） */
export function addMonths(b: Date, n: number): Date {
  const y = b.getFullYear();
  const m = b.getMonth() + n;
  const lastDay = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(b.getDate(), lastDay));
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

/**
 * 從生日 b 到日期 d 的年月日差。
 * 先找「往後推整數個月仍不超過 d」的最大月數，剩下的才用天數算，
 * 月底出生才不會算出負的天數（1/31 生，3/1 是 1 個月又 1 天）。
 */
export function diff(b: Date, d: Date): DateDiff {
  const sign: 1 | -1 = d < b ? -1 : 1;
  const a = sign > 0 ? b : d;
  const z = sign > 0 ? d : b;
  let months = (z.getFullYear() - a.getFullYear()) * 12 + (z.getMonth() - a.getMonth());
  if (addMonths(a, months) > z) months -= 1;
  const day = Math.round((z.getTime() - addMonths(a, months).getTime()) / DAY_MS);
  return { y: Math.floor(months / 12), m: months % 12, d: day, sign, months };
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

/** 下一個生日：日期、滿幾歲、還有幾天。今天就是生日時 days 是 0；還沒出生時 years 是 0、算到出生那天 */
export function nextBirthday(bd: Date, now: Date): { date: Date; years: number; days: number } {
  let years = Math.max(0, now.getFullYear() - bd.getFullYear());
  let date = addMonths(bd, years * 12);
  if (date < now) {
    years += 1;
    date = addMonths(bd, years * 12);
  }
  return { date, years, days: Math.round((date.getTime() - now.getTime()) / DAY_MS) };
}

/** "2026-10"：月份分隔與跳轉用的鍵 */
export function ymKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}
