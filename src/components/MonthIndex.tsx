import { Fragment, useEffect, useState } from "react";
import { monthName } from "../lib/date";
import type { MonthOption } from "./Controls";

interface Props {
  /** 時間軸裡有的月份，照目前排序 */
  months: MonthOption[];
  onJump: (ym: string) => void;
  hasChecklist: boolean;
  hasGrowth: boolean;
}

/** 桌機右欄的月份索引：列出每個月與筆數，捲到哪個月就標哪個；手機不顯示（CSS） */
export function MonthIndex({ months, onJump, hasChecklist, hasGrowth }: Props) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const pick = () => {
      // 依文件順序，最後一個標題已經捲過畫面上緣的就是目前所在的月份
      let cur: string | null = null;
      for (const mo of months) {
        const el = document.getElementById(`ym-${mo.ym}`);
        if (el && el.getBoundingClientRect().top <= 140) cur = mo.ym;
      }
      setActive(cur ?? months[0]?.ym ?? null);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    return () => window.removeEventListener("scroll", pick);
  }, [months]);

  if (!months.length) return <aside className="index" />;

  const goTo = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  let lastYear = "";
  return (
    <aside className="index" aria-label="月份索引">
      {months.map((mo) => {
        const [y, m] = mo.ym.split("-");
        const head = y !== lastYear ? <div className="h">{y}</div> : null;
        lastYear = y;
        return (
          <Fragment key={mo.ym}>
            {head}
            <button
              type="button"
              className={active === mo.ym ? "on" : undefined}
              onClick={() => onJump(mo.ym)}
            >
              {monthName(new Date(+y, +m - 1, 1))}
              <span>{mo.n}</span>
            </button>
          </Fragment>
        );
      })}
      {(hasChecklist || hasGrowth) && (
        <>
          <div className="gap" />
          <div className="h">其他</div>
          {hasChecklist && (
            <button type="button" onClick={() => goTo(".checklist")}>
              發展里程碑
            </button>
          )}
          {hasGrowth && (
            <button type="button" onClick={() => goTo(".growth")}>
              生長紀錄
            </button>
          )}
        </>
      )}
    </aside>
  );
}
