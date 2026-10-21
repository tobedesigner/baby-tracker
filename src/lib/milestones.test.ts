import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BabyInput, Filter, MilestoneInput } from "../types";
import { isBirthRow } from "../types";
import type { Criteria } from "./milestones";
import {
  ageChips,
  dotColor,
  inView,
  isPlain,
  lastRecordDate,
  matchesSearch,
  matchesTag,
  normalizeBabies,
  normalizeMilestones,
  seriesFor,
  visibleRows,
} from "./milestones";

const BABIES: BabyInput[] = [
  { id: "uwa", name: "予安", birthday: "2026-02-06", accent: "#E08A6E" },
  { id: "una", name: "予樂", birthday: "2026-02-06", accent: "#6E9EC4" },
];
const { babies, byId, allIds } = normalizeBabies(BABIES);
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const crit = (view: string, filter: Filter = null, extra: Partial<Criteria> = {}): Criteria => ({
  view,
  filter,
  tag: null,
  q: "",
  ...extra,
});

function norm(raw: MilestoneInput[]) {
  return normalizeMilestones(raw, byId);
}

beforeEach(() => {
  // 壞資料的測試本來就會觸發開發模式警告，不要洗版
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("normalizeBabies", () => {
  it("建好 id 索引，沒有 id 的跳過", () => {
    const r = normalizeBabies([...BABIES, { id: "", name: "x", birthday: null, accent: "" }]);
    expect(r.allIds).toEqual(["uwa", "una"]);
    expect(r.byId.uwa.bd).toEqual(d(2026, 2, 6));
  });

  it("生日 null 就沒有 bd", () => {
    const r = normalizeBabies([{ id: "x", name: "x", birthday: null, accent: "" }]);
    expect(r.babies[0].bd).toBeNull();
  });
});

describe("normalizeMilestones", () => {
  it("缺 date 或 title 的整筆略過並計數", () => {
    const { items, badCount } = norm([
      { date: "2026-09-09", title: "ok" },
      { date: "", title: "沒日期" },
      { date: "2026-02-30", title: "日期不存在" },
      { date: "2026-09-09", title: "  " },
    ]);
    expect(items.map((m) => m.title)).toEqual(["ok"]);
    expect(badCount).toBe(3);
  });

  it("who 的 id 全部找不到就整筆略過，不會變成全家共同", () => {
    const { items, badCount } = norm([{ date: "2026-09-09", title: "打錯", who: ["uwaa"] }]);
    expect(items).toHaveLength(0);
    expect(badCount).toBe(1);
  });

  it("who 有一部分找不到就留下找得到的", () => {
    const { items } = norm([{ date: "2026-09-09", title: "x", who: ["uwa", "typo"] }]);
    expect(items[0].who).toEqual(["uwa"]);
    expect(items[0].shared).toBe(false);
  });

  it("不寫 who 或寫空陣列都是全家共同", () => {
    const { items } = norm([
      { date: "2026-09-09", title: "a" },
      { date: "2026-09-09", title: "b", who: [] },
    ]);
    expect(items.every((m) => m.shared)).toBe(true);
  });

  it("endDate 要晚於 date 才算，否則當沒寫", () => {
    const { items } = norm([
      { date: "2026-07-30", endDate: "2026-08-02", title: "旅行" },
      { date: "2026-07-30", endDate: "2026-07-30", title: "同一天" },
      { date: "2026-07-30", endDate: "2026-07-01", title: "倒過來" },
      { date: "2026-07-30", endDate: "abc", title: "格式錯" },
    ]);
    expect(items[0].end).toEqual(d(2026, 8, 2));
    expect(items.slice(1).every((m) => m.end === null)).toBe(true);
  });

  it("分類打錯歸到日常，其餘欄位補預設值", () => {
    const { items } = norm([{ date: "2026-09-09", title: "x", category: "oops" as never }]);
    const m = items[0];
    expect(m.cat).toBe("daily");
    expect(m).toMatchObject({
      note: "",
      memo: "",
      photos: [],
      measures: null,
      place: "",
      people: [],
      tags: [],
      highlight: false,
    });
  });

  it("保留原始索引，同日期排序時用", () => {
    const { items } = norm([
      { date: "2026-09-09", title: "a" },
      { date: "2026-09-09", title: "b" },
    ]);
    expect(items.map((m) => m.i)).toEqual([0, 1]);
  });
});

describe("inView / visibleRows", () => {
  const { items } = norm([
    { date: "2026-10-01", title: "予安的事", who: ["uwa"] },
    { date: "2026-09-01", title: "兩個人的事", who: ["uwa", "una"], category: "travel" },
    { date: "2026-08-01", title: "全家的事" },
    { date: "2026-01-20", title: "產檢", who: ["una"], highlight: true },
    { date: "2026-08-01", title: "同一天的第二筆", who: ["una"] },
  ]);

  it("單一寶寶只看得到有他的事與全家共同的事", () => {
    expect(items.filter((m) => inView(m, "una", allIds)).map((m) => m.title)).toEqual([
      "兩個人的事",
      "全家的事",
      "產檢",
      "同一天的第二筆",
    ]);
  });

  it("新的在上：日期由新到舊，出生節點插在正確位置", () => {
    const rows = visibleRows(items, babies, allIds, crit("all"), -1);
    expect(rows.map((r) => (isBirthRow(r) ? `出生:${r.baby.id}` : r.title))).toEqual([
      "予安的事",
      "兩個人的事",
      "同一天的第二筆",
      "全家的事",
      "出生:uwa",
      "出生:una",
      "產檢",
    ]);
  });

  it("舊的在上：出生前的產檢排在出生前面", () => {
    const rows = visibleRows(items, babies, allIds, crit("una"), 1);
    expect(rows.map((r) => (isBirthRow(r) ? "出生" : r.title))).toEqual([
      "產檢",
      "出生",
      "全家的事",
      "同一天的第二筆",
      "兩個人的事",
    ]);
  });

  it("有篩選時不插出生節點", () => {
    const rows = visibleRows(items, babies, allIds, crit("all", "travel"), -1);
    expect(rows).toHaveLength(1);
    expect(rows.some(isBirthRow)).toBe(false);
  });

  it("重點篩選", () => {
    const rows = visibleRows(items, babies, allIds, crit("all", "hl"), -1);
    expect(rows.map((r) => !isBirthRow(r) && r.title)).toEqual(["產檢"]);
  });
});

describe("ageChips", () => {
  const { items } = norm([
    { date: "2026-01-20", title: "全家的事，出生前" },
    { date: "2026-01-20", title: "予樂產檢", who: ["una"] },
    { date: "2026-10-21", title: "兩個人的事", who: ["uwa", "una"] },
  ]);

  it("全家共同的事只顯示當時已出生的寶寶", () => {
    expect(ageChips(items[0], "all", byId, allIds)).toEqual([]);
  });

  it("明確寫 who 的就算出生前也顯示", () => {
    const chips = ageChips(items[1], "all", byId, allIds);
    expect(chips.map((c) => [c.baby.id, c.text])).toEqual([["una", "出生前 17 天"]]);
  });

  it("看單一寶寶時只算他自己", () => {
    const chips = ageChips(items[2], "uwa", byId, allIds);
    expect(chips.map((c) => c.baby.id)).toEqual(["uwa"]);
    expect(chips[0].text).toBe("8 個月又 15 天");
  });
});

describe("dotColor", () => {
  const { items } = norm([
    { date: "2026-10-01", title: "一個人", who: ["uwa"], category: "health" },
    { date: "2026-10-01", title: "兩個人", who: ["uwa", "una"], category: "health" },
  ]);

  it("看全部：一個人的事用寶寶代表色，共同的事用預設", () => {
    expect(dotColor(items[0], "all", byId)).toBe("#E08A6E");
    expect(dotColor(items[1], "all", byId)).toBeNull();
  });

  it("看單一寶寶：顏色留給分類", () => {
    expect(dotColor(items[0], "uwa", byId)).toBe("#6E9EC4");
  });
});

describe("seriesFor / lastRecordDate", () => {
  const { items } = norm([
    { date: "2026-10-06", title: "八個月", who: ["uwa"], measures: { height: 70, weight: 8.5 } },
    { date: "2026-06-06", title: "四個月", who: ["uwa"], measures: { height: 63 } },
    { date: "2026-08-06", title: "兩個人", who: ["uwa", "una"], measures: { height: 66 } },
    { date: "2026-01-20", title: "出生前", who: ["uwa"], measures: { height: 50 } },
    { date: "2026-09-13", endDate: "2026-09-21", title: "感冒", who: ["una"] },
  ]);

  it("只算 who 剛好一個人、出生後的紀錄，依月齡排序", () => {
    const pts = seriesFor(items, byId.uwa, "height");
    expect(pts.map((p) => [p.x, p.v])).toEqual([
      [4, 63],
      [8, 70],
    ]);
    expect(seriesFor(items, byId.uwa, "weight")).toHaveLength(1);
    expect(seriesFor(items, byId.uwa, "head")).toHaveLength(0);
  });

  it("沒生日就畫不出曲線", () => {
    const { byId: b2 } = normalizeBabies([{ id: "uwa", name: "x", birthday: null, accent: "" }]);
    expect(seriesFor(items, b2.uwa, "height")).toEqual([]);
  });

  it("最後一筆紀錄算跨天的結束日", () => {
    expect(lastRecordDate(items)).toEqual(d(2026, 10, 6));
    expect(lastRecordDate(items.filter((m) => m.title === "感冒"))).toEqual(d(2026, 9, 21));
    expect(lastRecordDate([])).toBeNull();
  });
});

describe("matchesTag / matchesSearch / isPlain", () => {
  const { items } = norm([
    { date: "2026-09-28", title: "第二次感冒", who: ["una"], note: "疑似二度感染。", tags: ["感冒"] },
    { date: "2026-09-26", title: "第一次吃魚片", who: ["uwa", "una"], place: "火鍋店", tags: ["副食品"] },
    { date: "2026-09-30", title: "吐奶", who: ["una"], people: ["爸爸"], memo: "心疼", tags: ["吐奶"] },
  ]);

  it("標籤要完全相同", () => {
    expect(items.filter((m) => matchesTag(m, "感冒")).map((m) => m.title)).toEqual(["第二次感冒"]);
    expect(items.filter((m) => matchesTag(m, "感")).length).toBe(0);
    expect(items.every((m) => matchesTag(m, null))).toBe(true);
  });

  it("搜尋比對標題、說明、備註、地點、人與標籤，忽略大小寫與前後空白", () => {
    const hit = (q: string) => items.filter((m) => matchesSearch(m, q)).map((m) => m.title);
    expect(hit("感染")).toEqual(["第二次感冒"]);
    expect(hit("火鍋")).toEqual(["第一次吃魚片"]);
    expect(hit("爸爸")).toEqual(["吐奶"]);
    expect(hit("心疼")).toEqual(["吐奶"]);
    expect(hit("副食品")).toEqual(["第一次吃魚片"]);
    expect(hit("  感冒 ")).toEqual(["第二次感冒"]);
    expect(hit("")).toHaveLength(3);
    expect(hit("   ")).toHaveLength(3);
    expect(hit("沒有這個")).toHaveLength(0);
  });

  it("有標籤或搜尋時不插出生節點", () => {
    const byTag = visibleRows(items, babies, allIds, crit("una", null, { tag: "感冒" }), -1);
    expect(byTag.map((r) => !isBirthRow(r) && r.title)).toEqual(["第二次感冒"]);
    const byQ = visibleRows(items, babies, allIds, crit("all", null, { q: "吐" }), -1);
    expect(byQ.map((r) => !isBirthRow(r) && r.title)).toEqual(["吐奶"]);
    expect(isPlain(crit("all"))).toBe(true);
    expect(isPlain(crit("all", "hl"))).toBe(false);
    expect(isPlain(crit("all", null, { q: " " }))).toBe(true);
  });
});
