import type { CSSProperties } from "react";
import type { ChecklistRow } from "../lib/checklist";
import { checklistProgress } from "../lib/checklist";

interface Props {
  rows: ChecklistRow[];
  /** 看「全部」且有多個寶寶時格子裡要標名字 */
  multi: boolean;
  /** 點已達成的格子跳到時間軸那筆 */
  onJump: (id: string) => void;
}

/** 發展里程碑清單：每項對每個寶寶一格，達成的顯示年齡並可跳到紀錄 */
export function Checklist({ rows, multi, onJump }: Props) {
  if (!rows.length || !rows[0].cells.length) return null;
  const progress = checklistProgress(rows);

  return (
    <section className="checklist">
      <h2>發展里程碑</h2>
      <p className="hint">
        常見月齡只是參考，早一點晚一點都正常。記錄時在那筆加上 milestone 代號，這裡就會打勾。
      </p>
      <div className="progress">
        {progress.map((p) => (
          <span key={p.baby.id} style={{ "--wc": p.baby.accent } as CSSProperties}>
            {multi && <b>{p.baby.name}</b>}
            {p.done}／{p.total}
          </span>
        ))}
      </div>
      <ol className="ck">
        {rows.map((r) => (
          <li key={r.item.key} className={`ck-row${r.cells.some((c) => c.m) ? " done" : ""}`}>
            <div className="ck-what">
              <b>{r.item.label}</b>
              <span>
                常見 {r.item.from}～{r.item.to} 個月
              </span>
            </div>
            <div className="ck-cells">
              {r.cells.map((c) =>
                c.m ? (
                  <button
                    key={c.baby.id}
                    type="button"
                    className="ck-cell done"
                    style={{ "--wc": c.baby.accent } as CSSProperties}
                    title="看那筆紀錄"
                    onClick={() => onJump(c.m!.id)}
                  >
                    {multi && <b>{c.baby.name}</b>}✓ {c.age}
                  </button>
                ) : (
                  <span
                    key={c.baby.id}
                    className={`ck-cell${c.now ? " now" : ""}`}
                    style={{ "--wc": c.baby.accent } as CSSProperties}
                  >
                    {multi && <b>{c.baby.name}</b>}
                    {c.now ? "差不多是時候" : "－"}
                  </span>
                ),
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
