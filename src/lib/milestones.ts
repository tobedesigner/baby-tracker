import type {
  Baby,
  BabyInput,
  CategoryKey,
  Filter,
  Measures,
  Milestone,
  MilestoneInput,
  Order,
  Row,
  View,
} from "../types";
import { CATS, DEFAULT_CATEGORY, isCategoryKey } from "./categories";
import { ageText, diff, parseDate } from "./date";
import { milestoneId } from "./id";

export { milestoneId, shortHash } from "./id";

/** 生日字串解析成 Date，並建好 id 索引 */
export function normalizeBabies(input: BabyInput[]): {
  babies: Baby[];
  byId: Record<string, Baby>;
  allIds: string[];
} {
  const babies = input.filter((b) => b && b.id).map((b) => ({ ...b, bd: parseDate(b.birthday) }));
  const byId: Record<string, Baby> = {};
  babies.forEach((b) => {
    byId[b.id] = b;
  });
  return { babies, byId, allIds: babies.map((b) => b.id) };
}

/**
 * 資料有問題時在開發模式印到 console，改完存檔當下就看得到。
 * 正式版不印：推上去前有 npm run check 擋，這裡只是備援。
 */
function warn(i: number, r: MilestoneInput, msg: string): void {
  if (import.meta.env.DEV) {
    console.warn(`milestones[${i}] ${r.date ?? "(無日期)"}「${r.title ?? "(無標題)"}」：${msg}`);
  }
}

/**
 * 把手寫的資料補成完整的 Milestone。
 * 缺 date 或 title、或 who 的 id 全部找不到的整筆略過，計進 badCount 顯示在筆數旁邊。
 * 其餘打錯的欄位退回預設值，不讓一個欄位拖垮整筆。
 */
export function normalizeMilestones(
  raw: MilestoneInput[],
  byId: Record<string, Baby>,
): { items: Milestone[]; badCount: number } {
  const seenIds = new Set<string>();
  const items = raw
    .map((r, i): Milestone | null => {
      const date = parseDate(r.date);
      if (!date) {
        warn(i, r, "date 缺了、格式不對或日期不存在，整筆略過");
        return null;
      }
      if (!r.title || !String(r.title).trim()) {
        warn(i, r, "title 缺了，整筆略過");
        return null;
      }

      // who 寫了但一個都對不上：不能當成全家共同的事，那會同時出現在每個寶寶頁面
      const wanted = r.who ?? [];
      const who = wanted.filter((id) => byId[id]);
      if (wanted.length && !who.length) {
        warn(i, r, `who 的 id 都找不到（${wanted.join("、")}），整筆略過`);
        return null;
      }
      if (who.length < wanted.length) {
        warn(i, r, `who 有找不到的 id：${wanted.filter((id) => !byId[id]).join("、")}`);
      }

      const end = parseDate(r.endDate);
      if (r.endDate !== undefined && !end) warn(i, r, "endDate 格式不對，當作沒寫");
      if (end && end <= date) warn(i, r, "endDate 沒有晚於 date，當作沒寫");

      if (r.category !== undefined && !isCategoryKey(r.category)) {
        warn(i, r, `category「${r.category}」不在分類表裡，歸到「日常」`);
      }
      const cat: CategoryKey = isCategoryKey(r.category) ? r.category : DEFAULT_CATEGORY;

      if (r.measures && who.length !== 1) {
        warn(i, r, "有 measures 但 who 不是剛好一個人，這筆數字不會進生長曲線");
      }

      // 代號撞到就加序號，連結至少還開得到；npm run check 會要求改成不同的 id
      let id = milestoneId(r);
      if (seenIds.has(id)) {
        warn(i, r, `代號 ${id} 跟另一筆重複，請加一個不同的 id`);
        let n = 2;
        while (seenIds.has(`${id}-${n}`)) n += 1;
        id = `${id}-${n}`;
      }
      seenIds.add(id);

      return {
        i,
        id,
        date,
        end: end && end > date ? end : null,
        title: String(r.title).trim(),
        cat,
        catColor: CATS[cat].color,
        who, // 空陣列＝全家共同
        shared: who.length === 0,
        note: r.note ?? "",
        memo: r.memo ?? "",
        photos: r.photos ?? [],
        measures: r.measures ?? null,
        place: r.place ?? "",
        people: r.people ?? [],
        tags: r.tags ?? [],
        highlight: !!r.highlight,
        milestone: r.milestone ?? null,
      };
    })
    .filter((m): m is Milestone => m !== null);

  return { items, badCount: raw.length - items.length };
}

/** 這一筆跟誰有關（沒寫 who ＝ 全部） */
export function idsOf(m: Milestone, allIds: string[]): string[] {
  return m.shared ? allIds : m.who;
}

/** 目前檢視看不看得到這一筆 */
export function inView(m: Milestone, view: View, allIds: string[]): boolean {
  return view === "all" || idsOf(m, allIds).indexOf(view) >= 0;
}

/** 分類篩選：null＝全部、"hl"＝重點、其餘比對分類代號 */
export function matchesFilter(m: Milestone, filter: Filter): boolean {
  if (filter === null) return true;
  if (filter === "hl") return m.highlight;
  return m.cat === filter;
}

/** 標籤篩選：點卡片上的標籤設定；null＝不限 */
export function matchesTag(m: Milestone, tag: string | null): boolean {
  return tag === null || m.tags.includes(tag);
}

/** 搜尋標題、說明、備註、地點、在場的人與標籤；不分大小寫、忽略前後空白，空字串＝不限 */
export function matchesSearch(m: Milestone, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return [m.title, m.note, m.memo, m.place, ...m.people, ...m.tags].some((f) =>
    f.toLowerCase().includes(s),
  );
}

/** 時間軸目前套用的全部條件 */
export interface Criteria {
  view: View;
  filter: Filter;
  tag: string | null;
  q: string;
}

export function matchesCriteria(m: Milestone, c: Criteria, allIds: string[]): boolean {
  return (
    inView(m, c.view, allIds) &&
    matchesFilter(m, c.filter) &&
    matchesTag(m, c.tag) &&
    matchesSearch(m, c.q)
  );
}

/** 除了「看誰」之外沒有任何條件：這時才插出生節點、空列表才算真的沒資料 */
export function isPlain(c: Criteria): boolean {
  return c.filter === null && c.tag === null && !c.q.trim();
}

/**
 * 套上全部條件、插入出生節點、依日期排序。
 * 出生當作時間軸節點跟著日期一起排，產檢這類出生前的紀錄才會排在下面；
 * 有任何篩選或搜尋時就不插，免得「搜 感冒」卻跑出出生那筆。
 */
export function visibleRows(
  items: Milestone[],
  babies: Baby[],
  allIds: string[],
  c: Criteria,
  order: Order,
): Row[] {
  const rows: Row[] = items.filter((m) => matchesCriteria(m, c, allIds));

  if (isPlain(c)) {
    babies.forEach((baby) => {
      if (!baby.bd) return;
      if (c.view !== "all" && c.view !== baby.id) return;
      rows.push({ isBirth: true, baby, date: baby.bd, i: -1 });
    });
  }

  return rows.sort((a, b) => order * (a.date.getTime() - b.date.getTime()) || order * (a.i - b.i));
}

export interface GrowthPoint {
  /** 月齡（可含小數） */
  x: number;
  v: number;
  d: Date;
}

/** 量測只算 who 剛好一個人的紀錄（不然不知道數字是誰的） */
export function seriesFor(items: Milestone[], baby: Baby, key: keyof Measures): GrowthPoint[] {
  if (!baby.bd) return [];
  const bd = baby.bd;
  return items
    .filter(
      (m) =>
        m.measures != null &&
        m.who.length === 1 &&
        m.who[0] === baby.id &&
        m.measures[key] != null &&
        (m.measures[key] as unknown) !== "",
    )
    .map((m) => {
      const t = diff(bd, m.date);
      // diff 回的是絕對值，出生前的量測要靠 sign 變成負數才會被下面濾掉
      return { x: t.sign * (t.months + t.d / 30), v: Number(m.measures![key]), d: m.date };
    })
    .filter((p) => !isNaN(p.v) && p.x >= 0)
    .sort((a, b) => a.x - b.x);
}

/** 最後一筆紀錄的日期（跨天的算結束日） */
export function lastRecordDate(items: Milestone[]): Date | null {
  return items.reduce<Date | null>((acc, m) => {
    const d = m.end ?? m.date;
    return !acc || d > acc ? d : acc;
  }, null);
}

export interface AgeChip {
  baby: Baby;
  text: string;
}

/**
 * 這一筆要顯示哪些人的年齡：明確寫在 who 裡的一定顯示；
 * 全家共同的事只顯示當時已經出生的寶寶。
 * 看單一寶寶時只算他自己，才不會兩個數字並排卻分不出是誰。
 */
export function ageChips(
  m: Milestone,
  view: View,
  byId: Record<string, Baby>,
  allIds: string[],
): AgeChip[] {
  const pool = view === "all" ? idsOf(m, allIds) : [view];
  const out: AgeChip[] = [];
  pool.forEach((id) => {
    const baby = byId[id];
    if (!baby || !baby.bd) return;
    if (m.shared && m.date < baby.bd) return;
    out.push({ baby, text: ageText(baby.bd, m.date) });
  });
  return out;
}

/** 時間軸上小圓點的顏色：看全部時用寶寶代表色，看單一寶寶時顏色留給分類 */
export function dotColor(m: Milestone, view: View, byId: Record<string, Baby>): string | null {
  if (view !== "all") return m.catColor;
  if (m.who.length === 1) return byId[m.who[0]].accent;
  return null; // 共同事件：用預設灰
}
