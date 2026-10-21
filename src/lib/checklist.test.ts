import { describe, expect, it } from "vitest";
import type { ChecklistItem } from "../types";
import { checklistProgress, checklistRows } from "./checklist";
import { normalizeBabies, normalizeMilestones } from "./milestones";

const { babies, byId, allIds } = normalizeBabies([
  { id: "uwa", name: "予安", birthday: "2026-02-06", accent: "#E08A6E" },
  { id: "una", name: "予樂", birthday: "2026-02-06", accent: "#6E9EC4" },
]);
const LIST: ChecklistItem[] = [
  { key: "rollOver", label: "翻身", from: 4, to: 6 },
  { key: "sit", label: "坐", from: 6, to: 8 },
  { key: "walk", label: "走", from: 11, to: 15 },
];
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const { items } = normalizeMilestones(
  [
    { date: "2026-07-01", title: "予安翻身", who: ["uwa"], milestone: "rollOver" },
    { date: "2026-06-20", title: "予安其實更早翻", who: ["uwa"], milestone: "rollOver" },
    { date: "2026-09-01", title: "兩個都會坐了", who: ["uwa", "una"], milestone: "sit" },
  ],
  byId,
);

describe("checklistRows", () => {
  const rows = checklistRows(LIST, items, babies, "all", allIds, d(2026, 10, 21));

  it("取最早達成的那筆，兩個人都有份的兩邊都算", () => {
    const roll = rows[0].cells;
    expect(roll[0].m?.title).toBe("予安其實更早翻");
    expect(roll[0].age).toBe("4 個月又 14 天");
    expect(roll[1].m).toBeNull();
    expect(rows[1].cells.every((c) => c.m?.title === "兩個都會坐了")).toBe(true);
  });

  it("還沒達成且今天月齡在範圍內才標 now", () => {
    // 今天 8 個月：翻身（4～6）過了、坐（6～8）在範圍內但已達成、走（11～15）還沒到
    expect(rows[0].cells[1].now).toBe(false);
    expect(rows[1].cells[1].now).toBe(false);
    expect(rows[2].cells[0].now).toBe(false);
    const later = checklistRows(LIST, items, babies, "all", allIds, d(2027, 2, 1));
    expect(later[2].cells[0].now).toBe(true);
  });

  it("看單一寶寶只有他一格", () => {
    const one = checklistRows(LIST, items, babies, "una", allIds, d(2026, 10, 21));
    expect(one[0].cells).toHaveLength(1);
    expect(one[0].cells[0].baby.id).toBe("una");
  });

  it("進度每個寶寶各算", () => {
    expect(checklistProgress(rows).map((p) => [p.baby.id, p.done, p.total])).toEqual([
      ["uwa", 2, 3],
      ["una", 1, 3],
    ]);
  });
});
