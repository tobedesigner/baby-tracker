/* 分享連結用的代號。沒有任何相依，scripts/check-data.ts 也直接用 Node 載入它。 */
import type { MilestoneInput } from "../types";

/** 短雜湊：同樣的字串永遠得到同樣 5 碼 */
export function shortHash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(7, "0").slice(-5);
}

/** 有寫 id 就用它，否則用日期加標題與人算一個；改標題或 who 連結就會變，想固定就寫 id */
export function milestoneId(r: MilestoneInput): string {
  if (r.id) return String(r.id).trim();
  return `${String(r.date).trim()}-${shortHash(`${r.title}|${(r.who ?? []).join(",")}`)}`;
}
