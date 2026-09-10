import { Fragment } from "react";
import type { Baby, Row, View } from "../types";
import { isBirthRow } from "../types";
import { BirthCard } from "./BirthCard";
import { MilestoneCard } from "./MilestoneCard";

interface Props {
  rows: Row[];
  view: View;
  multi: boolean;
  byId: Record<string, Baby>;
  allIds: string[];
  onOpenPhoto: (src: string, alt: string) => void;
}

/** 依年份切段，每一段一條軸線 */
function groupByYear(rows: Row[]): { year: number; rows: Row[] }[] {
  const groups: { year: number; rows: Row[] }[] = [];
  rows.forEach((row) => {
    const year = row.date.getFullYear();
    const last = groups[groups.length - 1];
    if (!last || last.year !== year) groups.push({ year, rows: [row] });
    else last.rows.push(row);
  });
  return groups;
}

export function Timeline({ rows, view, multi, byId, allIds, onOpenPhoto }: Props) {
  if (!rows.length) {
    return (
      <main id="list">
        <div className="empty">這裡還沒有紀錄。</div>
      </main>
    );
  }

  return (
    <main id="list">
      {groupByYear(rows).map((g) => (
        <Fragment key={g.year}>
          <div className="year">
            <span>{g.year} 年</span>
          </div>
          <div className="tl">
            {g.rows.map((row) =>
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
                  onOpenPhoto={onOpenPhoto}
                />
              ),
            )}
          </div>
        </Fragment>
      ))}
    </main>
  );
}
