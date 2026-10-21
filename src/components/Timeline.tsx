import { Fragment } from "react";
import type { Baby, Row, View } from "../types";
import { isBirthRow } from "../types";
import { ymKey } from "../lib/date";
import type { Target } from "../lib/target";
import { BirthCard } from "./BirthCard";
import { MilestoneCard } from "./MilestoneCard";

interface Props {
  rows: Row[];
  view: View;
  multi: boolean;
  byId: Record<string, Baby>;
  allIds: string[];
  tag: string | null;
  onTag: (tag: string) => void;
  /** 有套任何篩選或搜尋：空列表時顯示「沒有符合」而不是「還沒有紀錄」 */
  filtered: boolean;
  onClear: () => void;
  /** 要捲過去並強調的那一筆 */
  target: Target | null;
  onOpenPhoto: (photos: string[], index: number, alt: string) => void;
}

interface MonthGroup {
  ym: string;
  label: string;
  rows: Row[];
}
interface YearGroup {
  year: number;
  months: MonthGroup[];
}

/** 依年份切段、年份裡再依月份分小節。每一年一條軸線，月份是軸線上的小標 */
function groupRows(rows: Row[]): YearGroup[] {
  const years: YearGroup[] = [];
  rows.forEach((row) => {
    const year = row.date.getFullYear();
    const ym = ymKey(row.date);
    let y = years[years.length - 1];
    if (!y || y.year !== year) {
      y = { year, months: [] };
      years.push(y);
    }
    let mo = y.months[y.months.length - 1];
    if (!mo || mo.ym !== ym) {
      mo = { ym, label: `${row.date.getMonth() + 1} 月`, rows: [] };
      y.months.push(mo);
    }
    mo.rows.push(row);
  });
  return years;
}

export function Timeline({
  rows,
  view,
  multi,
  byId,
  allIds,
  tag,
  onTag,
  filtered,
  onClear,
  target,
  onOpenPhoto,
}: Props) {
  if (!rows.length) {
    return (
      <main id="list">
        <div className="empty">
          {filtered ? (
            <>
              沒有符合的紀錄。
              <button type="button" className="linkbtn" onClick={onClear}>
                清除篩選
              </button>
            </>
          ) : (
            "這裡還沒有紀錄。"
          )}
        </div>
      </main>
    );
  }

  return (
    <main id="list">
      {groupRows(rows).map((g) => (
        <Fragment key={g.year}>
          <div className="year">
            <span>{g.year} 年</span>
          </div>
          <div className="tl">
            {g.months.map((mo) => (
              <Fragment key={mo.ym}>
                <div className="month" id={`ym-${mo.ym}`}>
                  <span>{mo.label}</span>
                </div>
                {mo.rows.map((row) =>
                  isBirthRow(row) ? (
                    <BirthCard key={`birth-${row.baby.id}`} row={row} view={view} multi={multi} />
                  ) : (
                    <MilestoneCard
                      key={`m-${row.i}`}
                      m={row}
                      view={view}
                      multi={multi}
                      byId={byId}
                      allIds={allIds}
                      tag={tag}
                      onTag={onTag}
                      isTarget={target?.id === row.id}
                      targetN={target?.n ?? 0}
                      onOpenPhoto={onOpenPhoto}
                    />
                  ),
                )}
              </Fragment>
            ))}
          </div>
        </Fragment>
      ))}
    </main>
  );
}
