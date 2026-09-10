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

/** 生日字串解析成 Date，並建好 id 索引 */
export function normalizeBabies(input: BabyInput[]): {
  babies: Baby[];
  byId: Record<string, Baby>;
  allIds: string[];
} {
  const babies = input
    .filter((b) => b && b.id)
    .map((b) => ({ ...b, bd: parseDate(b.birthday) }));
  const byId: Record<string, Baby> = {};
  babies.forEach((b) => {
    byId[b.id] = b;
  });
  return { babies, byId, allIds: babies.map((b) => b.id) };
}

/**
 * 把手寫的資料補成完整的 Milestone。
 * 缺 date 或 title 的整筆略過，計進 badCount 顯示在筆數旁邊。
 */
export function normalizeMilestones(
  raw: MilestoneInput[],
  byId: Record<string, Baby>,
): { items: Milestone[]; badCount: number } {
  const items = raw
    .map((r, i): Milestone | null => {
      const date = parseDate(r.date);
      if (!date || !r.title) return null;
      const end = parseDate(r.endDate);
      const cat: CategoryKey = isCategoryKey(r.category) ? r.category : DEFAULT_CATEGORY;
      const who = (r.who ?? []).filter((id) => byId[id]);
      return {
        i,
        date,
        end: end && end > date ? end : null,
        title: String(r.title),
        cat,
        catColor: CATS[cat].color,
        who, // 空陣列＝全家共同
        shared: who.length === 0,
        note: r.note ?? "",
        photos: r.photos ?? [],
        measures: r.measures ?? null,
        place: r.place ?? "",
        people: r.people ?? [],
        tags: r.tags ?? [],
        highlight: !!r.highlight,
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

/**
 * 套上檢視與分類篩選、插入出生節點、依日期排序。
 * 出生當作時間軸節點跟著日期一起排，產檢這類出生前的紀錄才會排在下面。
 */
export function visibleRows(
  items: Milestone[],
  babies: Baby[],
  allIds: string[],
  view: View,
  filter: Filter,
  order: Order,
): Row[] {
  const rows: Row[] = items.filter((m) => {
    if (!inView(m, view, allIds)) return false;
    if (filter === null) return true;
    if (filter === "hl") return m.highlight;
    return m.cat === filter;
  });

  if (filter === null) {
    babies.forEach((baby) => {
      if (!baby.bd) return;
      if (view !== "all" && view !== baby.id) return;
      rows.push({ isBirth: true, baby, date: baby.bd, i: -1 });
    });
  }

  return rows.sort(
    (a, b) => order * (a.date.getTime() - b.date.getTime()) || order * (a.i - b.i),
  );
}

export interface GrowthPoint {
  /** 月齡（可含小數） */
  x: number;
  v: number;
  d: Date;
}

/** 量測只算 who 剛好一個人的紀錄（不然不知道數字是誰的） */
export function seriesFor(
  items: Milestone[],
  baby: Baby,
  key: keyof Measures,
): GrowthPoint[] {
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
      return { x: t.months + t.d / 30, v: Number(m.measures![key]), d: m.date };
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
export function dotColor(
  m: Milestone,
  view: View,
  byId: Record<string, Baby>,
): string | null {
  if (view !== "all") return m.catColor;
  if (m.who.length === 1) return byId[m.who[0]].accent;
  return null; // 共同事件：用預設灰
}
