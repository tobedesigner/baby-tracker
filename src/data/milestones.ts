import type { MilestoneInput } from "../types";

/* ------------------------------------------------------------------
   里程碑資料。兩個寶寶共用這一份，每加一筆就在陣列裡多一個 { } 區塊，
   順序不用管，網站會自己依日期排。

   欄位一覽（只有 date 與 title 是必填，其餘都可以省略不寫）
   ------------------------------------------------------------------
   date       必填  "2026-09-09"      發生日期（跨天的事就是開始日）
   endDate    選填  "2026-08-02"      結束日，跨天的事才寫（旅行、住院之類）
                                      寫了就會顯示成「起 ～ 訖　共 N 天」，
                                      時間軸上的點也會拉長成一小段
   title      必填  "開始公托"         一句話標題，短一點在手機上比較好看
   who        選填  ["uwa"]           是誰的事，對應 babies.ts 的 id
                    ["uwa","una"]     兩個都有份（例如一起出遊）
                    不寫              全家共同的事，兩個寶寶的頁面都看得到
   category   選填  見下方分類表        決定顏色與篩選鈕，沒寫就歸到「日常」
   note       選填  "第一天只哭了五分鐘" 補充說明，可以寫多行（用 \n 換行）
   photos     選填  ["assets/photos/2026-09-09.jpg"]  可放多張，路徑從 public/ 算起
   measures   選填  { height: 62.5, weight: 6.8, head: 41.2 }
                    身高/體重/頭圍，單位是公分與公斤。有兩筆以上就會自動畫成長曲線。
                    ⚠️ 量身高體重請一筆一人，who 只寫一個，不然不知道是誰的數字。
   place      選填  "台北"
   people     選填  ["爸爸", "媽媽"]   當天一起在場的大人
   tags       選填  ["公托", "適應期"]  自由標籤，會顯示成小標
   highlight  選填  true              標成重點，卡片會有強調邊框並排進「重點」篩選

   分類表 category
   ------------------------------------------------------------------
   "first"    第一次   第一次翻身、第一次叫爸爸、第一顆牙
   "growth"   成長     量身高體重、換尺寸、長大一歲
   "health"   健康     打疫苗、健檢、生病復原
   "care"     照護     公托、保母、換照顧安排
   "daily"    日常     生活小事、有趣的反應
   "travel"   出遊     第一次出門、旅行
   "holiday"  節日     滿月、抓周、生日、過年
   ------------------------------------------------------------------ */

export const MILESTONES: MilestoneInput[] = [
  {
    date: "2026-09-25",
    title: "第一次體驗中秋節活動",
    who: ["uwa", "una"],
    category: "holiday",
    place: "松林",
    tags: ["中秋節"],
    highlight: true,
  },
  {
    date: "2026-09-13",
    endDate: "2026-09-21",
    title: "第一次感冒發燒",
    who: ["una"],
    category: "health",
    note: "流鼻涕、鼻塞。",
    tags: ["感冒"],
  },
  {
    date: "2026-09-09",
    title: "開始公托",
    who: ["uwa", "una"],
    category: "care",
    note: "第一天送公托。",
    highlight: true,
    tags: ["公托"],
  },
  {
    date: "2026-07-30",
    endDate: "2026-08-02",
    title: "第一次出遠門",
    who: ["uwa", "una"],
    category: "travel",
    place: "台東",
    tags: ["家庭旅遊"],
    highlight: true,
  },
  {
    date: "2026-06-13",
    endDate: "2026-06-14",
    title: "礁溪天公廟做膽",
    who: ["uwa", "una"],
    category: "holiday",
    place: "宜蘭礁溪",
    tags: ["習俗", "宜蘭"],
    highlight: true,
  },

  /* 以下是各種寫法的範例，用不到可以整段刪掉。

  {
    date: "2026-09-15",
    title: "第一次翻身",
    who: ["uwa"],
    category: "first",
    note: "從趴著翻回來，自己嚇一跳。",
    place: "客廳",
    people: ["爸爸", "媽媽"],
    photos: ["assets/photos/2026-09-15-roll.jpg"],
    highlight: true,
  },
  {
    date: "2026-10-01",
    title: "予安 八個月健檢",
    who: ["uwa"],                                   // 量測一筆一人
    category: "health",
    measures: { height: 62.5, weight: 6.8, head: 41.2 },
  },
  {
    date: "2026-10-01",
    title: "予樂 八個月健檢",
    who: ["una"],                                   // 同一天各記一筆，曲線才分得開
    category: "health",
    measures: { height: 63.1, weight: 7.0, head: 41.5 },
  },
  {
    date: "2027-02-10",
    title: "全家去墾丁",
    who: ["uwa", "una"],                            // 兩個都有份
    category: "travel",
    place: "墾丁",
  },
  {
    date: "2027-06-01",
    title: "搬家",
    category: "daily",                              // 不寫 who ＝ 全家共同
  },

  */
];
