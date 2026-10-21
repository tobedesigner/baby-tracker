import { useCallback, useEffect, useMemo, useState } from "react";
import type { Filter, Order } from "./types";
import { isBirthRow } from "./types";
import { BABIES } from "./data/babies";
import { MILESTONES } from "./data/milestones";
import { SITE } from "./data/site";
import { fmtDate } from "./lib/date";
import {
  inView,
  lastRecordDate,
  matchesFilter,
  normalizeBabies,
  normalizeMilestones,
  visibleRows,
} from "./lib/milestones";
import { defaultView, useHashView } from "./lib/useHashView";
import { useStuck } from "./lib/useStuck";
import { GrowthCharts } from "./components/GrowthCharts";
import { Lightbox } from "./components/Lightbox";
import { Sidebar } from "./components/Sidebar";
import { Timeline } from "./components/Timeline";

interface OpenPhoto {
  photos: string[];
  index: number;
  alt: string;
}

export function App() {
  const { babies, byId, allIds } = useMemo(() => normalizeBabies(BABIES), []);
  const { items, badCount } = useMemo(() => normalizeMilestones(MILESTONES, byId), [byId]);
  const multi = babies.length > 1;

  // 只有一個寶寶時網址切換沒有意義
  const isValidView = useCallback(
    (v: string) => multi && (v === "all" || !!byId[v]),
    [multi, byId],
  );
  const [view, setView] = useHashView(
    useMemo(() => defaultView(SITE, byId, allIds), [byId, allIds]),
    isValidView,
  );

  const [filter, setFilter] = useState<Filter>(null);
  const [order, setOrder] = useState<Order>(SITE.defaultOrder === "oldest" ? 1 : -1);
  const [photo, setPhoto] = useState<OpenPhoto | null>(null);

  const baby = view === "all" ? null : (byId[view] ?? null);

  // 整站主色跟著目前看的寶寶換
  useEffect(() => {
    const accent = baby ? baby.accent || SITE.accent : SITE.accent || "#8C7B6E";
    document.documentElement.style.setProperty("--accent", accent);
    document.title = `${baby ? `${baby.name}的` : ""}${SITE.title || "成長里程碑"}`;
  }, [baby]);

  const pool = useMemo(
    () => items.filter((m) => inView(m, view, allIds)),
    [items, view, allIds],
  );

  // 切換看誰之後，原本的篩選若在新範圍裡一筆都沒有就退回「全部」，
  // 不然 chip 消失、列表空白，卻看不出是哪個篩選造成的。
  // 在 render 期間調整 state 是 React 建議的作法，不會先畫出空白再跳回來。
  const [prevView, setPrevView] = useState(view);
  if (view !== prevView) {
    setPrevView(view);
    if (filter !== null && !pool.some((m) => matchesFilter(m, filter))) setFilter(null);
  }

  const rows = useMemo(
    () => visibleRows(items, babies, allIds, view, filter, order),
    [items, babies, allIds, view, filter, order],
  );

  const shown = rows.filter((r) => !isBirthRow(r)).length;
  const countLabel = `${shown} 則${badCount ? `（${badCount} 筆格式有誤已略過）` : ""}`;
  const last = useMemo(() => lastRecordDate(items), [items]);

  const { sentinelRef, stuck } = useStuck();
  const closePhoto = useCallback(() => setPhoto(null), []);

  return (
    <>
      <div className="shell">
        <Sidebar
          site={SITE}
          babies={babies}
          baby={baby}
          multi={multi}
          view={view}
          onView={setView}
          pool={pool}
          filter={filter}
          onFilter={setFilter}
          countLabel={countLabel}
          order={order}
          onToggleOrder={() => setOrder((o) => (o === -1 ? 1 : -1))}
          stuck={stuck}
          sentinelRef={sentinelRef}
        />

        <div className="main">
          <Timeline
            rows={rows}
            view={view}
            multi={multi}
            byId={byId}
            allIds={allIds}
            onOpenPhoto={(photos, index, alt) => setPhoto({ photos, index, alt })}
          />
          <GrowthCharts items={items} babies={babies} view={view} byId={byId} />
          <footer>
            <div>{last ? `最後一筆紀錄：${fmtDate(last)}` : "還沒有任何紀錄"}</div>
          </footer>
        </div>
      </div>

      {photo && (
        <Lightbox photos={photo.photos} start={photo.index} alt={photo.alt} onClose={closePhoto} />
      )}
    </>
  );
}
