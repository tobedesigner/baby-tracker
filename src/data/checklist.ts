import type { ChecklistItem } from "../types";

/* ------------------------------------------------------------------
   發展里程碑清單。月齡是常見範圍，不是標準，早一點晚一點都正常；
   有疑慮以健檢醫師的判斷為準。

   記錄到了就在那筆里程碑加 milestone: "<key>"，清單會打勾並連到那筆：
     { date: "2026-06-20", title: "第一次翻身", who: ["uwa"], category: "first", milestone: "rollOver" }
   想加項目就在陣列多一筆，key 取短一點的英文，設定之後不要改。
   ------------------------------------------------------------------ */

export const CHECKLIST: ChecklistItem[] = [
  { key: "smile", label: "社交性微笑", from: 1, to: 3 },
  { key: "headUp", label: "趴著能抬頭", from: 2, to: 4 },
  { key: "laugh", label: "出聲笑", from: 3, to: 5 },
  { key: "rollOver", label: "翻身", from: 4, to: 6 },
  { key: "solids", label: "開始吃副食品", from: 4, to: 6 },
  { key: "sit", label: "不用扶自己坐", from: 6, to: 8 },
  { key: "tooth", label: "長第一顆牙", from: 6, to: 10 },
  { key: "crawl", label: "會爬", from: 7, to: 10 },
  { key: "pullUp", label: "扶著站起來", from: 8, to: 10 },
  { key: "wave", label: "揮手再見、拍手", from: 9, to: 12 },
  { key: "pincer", label: "用拇指和食指撿小東西", from: 9, to: 12 },
  { key: "babble", label: "發出爸爸媽媽的音", from: 9, to: 12 },
  { key: "walk", label: "放手走", from: 11, to: 15 },
  { key: "firstWords", label: "有意義地叫爸爸媽媽", from: 12, to: 15 },
  { key: "cup", label: "自己拿杯子喝", from: 12, to: 18 },
  { key: "stack", label: "疊兩塊積木", from: 15, to: 20 },
  { key: "run", label: "會跑", from: 18, to: 24 },
  { key: "twoWords", label: "說兩個字的句子", from: 20, to: 30 },
];
