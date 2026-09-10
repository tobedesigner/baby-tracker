import type { CategoryKey } from "../types";

/** 分類的顯示名稱與顏色。改顏色改這裡就好，篩選鈕與卡片會一起換。 */
export const CATS: Record<CategoryKey, { label: string; color: string }> = {
  first:   { label: "第一次", color: "#E4785F" },
  growth:  { label: "成長",   color: "#7FA46F" },
  health:  { label: "健康",   color: "#6E9EC4" },
  care:    { label: "照護",   color: "#C99038" },
  daily:   { label: "日常",   color: "#A38BBE" },
  travel:  { label: "出遊",   color: "#4FA79A" },
  holiday: { label: "節日",   color: "#D57C9D" },
};

/** 篩選鈕的排列順序，跟上面的定義順序一致 */
export const CATEGORY_KEYS = Object.keys(CATS) as CategoryKey[];

/** 沒寫 category 就歸到這一類 */
export const DEFAULT_CATEGORY: CategoryKey = "daily";

export function isCategoryKey(v: unknown): v is CategoryKey {
  return typeof v === "string" && v in CATS;
}
