import { describe, expect, it } from "vitest";
import { addMonths, ageText, diff, fmtRange, parseDate, spanDays } from "./date";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe("parseDate", () => {
  it("接受 - / . 三種分隔，月日可不補零", () => {
    expect(parseDate("2026-09-09")).toEqual(d(2026, 9, 9));
    expect(parseDate("2026/9/9")).toEqual(d(2026, 9, 9));
    expect(parseDate("2026.09.09")).toEqual(d(2026, 9, 9));
    expect(parseDate(" 2026-09-09 ")).toEqual(d(2026, 9, 9));
  });

  it("格式不對回 null", () => {
    for (const s of ["", "2026-9", "20260909", "abc", "2026-09-09T00:00", null, undefined]) {
      expect(parseDate(s)).toBeNull();
    }
  });

  it("不存在的日期回 null，不會悄悄進位到下個月", () => {
    expect(parseDate("2026-02-30")).toBeNull();
    expect(parseDate("2026-04-31")).toBeNull();
    expect(parseDate("2026-13-01")).toBeNull();
    expect(parseDate("2025-02-29")).toBeNull();
    expect(parseDate("2024-02-29")).toEqual(d(2024, 2, 29));
  });
});

describe("addMonths", () => {
  it("月底不存在的日子取該月最後一天", () => {
    expect(addMonths(d(2026, 1, 31), 1)).toEqual(d(2026, 2, 28));
    expect(addMonths(d(2026, 1, 31), 2)).toEqual(d(2026, 3, 31));
    expect(addMonths(d(2026, 1, 31), 3)).toEqual(d(2026, 4, 30));
    expect(addMonths(d(2024, 2, 29), 12)).toEqual(d(2025, 2, 28));
  });

  it("跨年", () => {
    expect(addMonths(d(2026, 11, 15), 3)).toEqual(d(2027, 2, 15));
  });
});

describe("diff / ageText", () => {
  it("出生當天、出生幾天、幾個月又幾天", () => {
    const b = d(2026, 2, 6);
    expect(ageText(b, d(2026, 2, 6))).toBe("出生當天");
    expect(ageText(b, d(2026, 2, 20))).toBe("出生 14 天");
    expect(ageText(b, d(2026, 3, 6))).toBe("1 個月");
    expect(ageText(b, d(2026, 10, 21))).toBe("8 個月又 15 天");
    expect(ageText(b, d(2027, 2, 5))).toBe("11 個月又 30 天");
  });

  it("月底出生不會算出負的天數", () => {
    const b = d(2026, 1, 31);
    expect(ageText(b, d(2026, 2, 28))).toBe("1 個月");
    expect(ageText(b, d(2026, 3, 1))).toBe("1 個月又 1 天");
    expect(ageText(b, d(2026, 3, 2))).toBe("1 個月又 2 天");
    expect(ageText(b, d(2026, 3, 31))).toBe("2 個月");
    expect(ageText(b, d(2026, 4, 30))).toBe("3 個月");
    expect(diff(b, d(2026, 3, 1)).d).toBeGreaterThanOrEqual(0);
  });

  it("閏年 2/29 出生", () => {
    const b = d(2024, 2, 29);
    expect(ageText(b, d(2024, 3, 29))).toBe("1 個月");
    expect(ageText(b, d(2025, 2, 28))).toBe("1 歲");
    expect(diff(b, d(2025, 3, 1))).toMatchObject({ y: 1, m: 0, d: 1, months: 12 });
  });

  it("滿一歲後只顯示歲與月", () => {
    const b = d(2026, 2, 6);
    expect(ageText(b, d(2027, 2, 6))).toBe("1 歲");
    expect(ageText(b, d(2027, 4, 6))).toBe("1 歲 2 個月");
    expect(ageText(b, d(2027, 4, 20))).toBe("1 歲 2 個月");
    expect(ageText(b, d(2028, 2, 6))).toBe("2 歲");
  });

  it("出生前的紀錄", () => {
    const b = d(2026, 2, 6);
    expect(ageText(b, d(2026, 1, 25))).toBe("出生前 12 天");
    expect(diff(b, d(2026, 1, 25)).sign).toBe(-1);
  });

  it("沒有生日就不顯示年齡", () => {
    expect(ageText(null, d(2026, 1, 25))).toBe("");
  });

  it("months 是總月數，生長曲線橫軸用", () => {
    const b = d(2026, 2, 6);
    expect(diff(b, d(2026, 10, 21))).toMatchObject({ y: 0, m: 8, d: 15, months: 8 });
    expect(diff(b, d(2027, 4, 20))).toMatchObject({ y: 1, m: 2, d: 14, months: 14 });
  });
});

describe("fmtRange / spanDays", () => {
  it("同年只寫結束的月日", () => {
    expect(fmtRange(d(2026, 7, 30), d(2026, 8, 2))).toBe("2026/07/30（四） ～ 08/02（日）");
  });

  it("跨年補上年份", () => {
    expect(fmtRange(d(2026, 12, 30), d(2027, 1, 2))).toBe("2026/12/30（三） ～ 2027/01/02（六）");
  });

  it("沒有結束日就只有一個日期", () => {
    expect(fmtRange(d(2026, 7, 30), null)).toBe("2026/07/30（四）");
  });

  it("天數含頭尾", () => {
    expect(spanDays(d(2026, 7, 30), d(2026, 8, 2))).toBe(4);
    expect(spanDays(d(2026, 7, 30), d(2026, 7, 30))).toBe(1);
  });
});
