/* 全站共用型別。編輯 data/ 底下的資料檔時，欄位打錯會直接在編輯器紅字。 */

/** 分類代號，決定顏色與篩選鈕 */
export type CategoryKey =
  | "first"
  | "growth"
  | "health"
  | "care"
  | "daily"
  | "travel"
  | "holiday";

/** 身高／體重／頭圍，單位是公分與公斤 */
export interface Measures {
  height?: number;
  weight?: number;
  head?: number;
}

/** 手寫在 data/milestones.ts 的一筆里程碑：只有 date 與 title 必填 */
export interface MilestoneInput {
  /** "2026-09-09"；跨天的事就是開始日 */
  date: string;
  /** 結束日，只有跨天的事要寫（旅行、住院） */
  endDate?: string;
  title: string;
  /** 是誰的事，對應 babies.ts 的 id；不寫＝全家共同 */
  who?: string[];
  /** 沒寫歸到「日常」 */
  category?: CategoryKey;
  /** 補充說明，\n 可換行 */
  note?: string;
  /** 路徑從 public/ 算起，例如 "assets/photos/a.jpg" */
  photos?: string[];
  /** 量測請一筆一人（who 只寫一個），不然不知道數字是誰的 */
  measures?: Measures;
  place?: string;
  people?: string[];
  tags?: string[];
  /** 標成重點：卡片加強調，並排進「重點」篩選 */
  highlight?: boolean;
}

/** 手寫在 data/babies.ts 的一個寶寶 */
export interface BabyInput {
  /** 給程式與網址用（#uwa），設定之後不要再改 */
  id: string;
  name: string;
  /** "YYYY-MM-DD"；不想公開確切生日就填 null，時間軸照常運作 */
  birthday: string | null;
  /** 代表色 */
  accent: string;
}

/** 生日字串解析成 Date 之後的寶寶 */
export interface Baby extends BabyInput {
  bd: Date | null;
}

export interface SiteConfig {
  title: string;
  subtitle: string;
  accent: string;
  defaultOrder: "newest" | "oldest";
  /** "all" 或某個寶寶的 id */
  defaultView: string;
}

/** 正規化之後的里程碑：日期已是 Date、缺的欄位都補了預設值 */
export interface Milestone {
  /** 原始陣列索引，同日期時用來穩定排序 */
  i: number;
  date: Date;
  end: Date | null;
  title: string;
  cat: CategoryKey;
  catColor: string;
  who: string[];
  /** who 是空的＝全家共同 */
  shared: boolean;
  note: string;
  photos: string[];
  measures: Measures | null;
  place: string;
  people: string[];
  tags: string[];
  highlight: boolean;
}

/** 出生也是時間軸上的一個節點，跟里程碑一起排 */
export interface BirthRow {
  isBirth: true;
  baby: Baby;
  date: Date;
  i: number;
}

export type Row = Milestone | BirthRow;

export function isBirthRow(row: Row): row is BirthRow {
  return "isBirth" in row;
}

/** 檢視狀態："all" 或某個寶寶的 id */
export type View = string;

/** 篩選狀態：null＝全部、"hl"＝重點、其餘是分類代號 */
export type Filter = CategoryKey | "hl" | null;

/** 排序方向：-1 新的在上、1 舊的在上 */
export type Order = -1 | 1;
