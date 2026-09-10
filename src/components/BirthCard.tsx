import type { CSSProperties } from "react";
import type { BirthRow, View } from "../types";
import { fmtDate } from "../lib/date";

interface Props {
  row: BirthRow;
  view: View;
  multi: boolean;
}

/** 出生也是時間軸上的一個節點 */
export function BirthCard({ row, view, multi }: Props) {
  return (
    <div
      className="birth"
      style={{ "--c": row.baby.accent || "var(--accent)" } as CSSProperties}
    >
      <div className="card">
        <div className="top">
          <span className="date">{fmtDate(row.date)}</span>
        </div>
        <h3>{`${multi && view === "all" ? `${row.baby.name} ` : ""}出生 🍼`}</h3>
      </div>
    </div>
  );
}
