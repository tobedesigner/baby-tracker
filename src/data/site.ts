import type { SiteConfig } from "../types";

/* ------------------------------------------------------------------
   整站設定。寶寶各自的名字與生日在 babies.ts。
   ------------------------------------------------------------------ */

export const SITE: SiteConfig = {
  // 「全部」檢視時的大標題與瀏覽器分頁標題
  title: "成長里程碑",

  // 副標題，一句話就好；不想要就寫 ""
  subtitle: "予安 · 予樂",

  // 「全部」檢視時的主色（切到單一寶寶時會換成該寶寶的 accent）
  accent: "#8C7B6E",

  // 預設排序："newest"（新的在上）或 "oldest"（從出生看起）
  defaultOrder: "newest",

  // 預設檢視："all" 或某個寶寶的 id（例如 "uwa"）
  defaultView: "all",
};
