import type { Baby, ChecklistItem, Milestone, View } from "../types";
import { ageText, diff } from "./date";
import { idsOf } from "./milestones";

export interface ChecklistCell {
  baby: Baby;
  /** 最早一筆對應到這項的紀錄；沒有就 null */
  m: Milestone | null;
  /** 達成時的年齡 */
  age: string;
  /** 還沒達成，而且今天的月齡正落在常見範圍裡 */
  now: boolean;
}

export interface ChecklistRow {
  item: ChecklistItem;
  cells: ChecklistCell[];
}

/** 每一項對每個寶寶的狀態。看單一寶寶時只有他一格 */
export function checklistRows(
  list: ChecklistItem[],
  items: Milestone[],
  babies: Baby[],
  view: View,
  allIds: string[],
  today: Date,
): ChecklistRow[] {
  const who = view === "all" ? babies : babies.filter((b) => b.id === view);
  return list.map((item) => ({
    item,
    cells: who.map((baby) => {
      const hit = items
        .filter((m) => m.milestone === item.key && idsOf(m, allIds).includes(baby.id))
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
      const m = hit ?? null;
      let now = false;
      if (!m && baby.bd && today >= baby.bd) {
        const t = diff(baby.bd, today);
        now = t.months >= item.from && t.months <= item.to;
      }
      return { baby, m, age: m && baby.bd ? ageText(baby.bd, m.date) : "", now };
    }),
  }));
}

/** 「予安 3／18」這種進度，看全部時每個寶寶一個 */
export function checklistProgress(
  rows: ChecklistRow[],
): { baby: Baby; done: number; total: number }[] {
  if (!rows.length) return [];
  return rows[0].cells.map((c, i) => ({
    baby: c.baby,
    done: rows.filter((r) => r.cells[i].m).length,
    total: rows.length,
  }));
}
