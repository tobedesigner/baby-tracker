import { useCallback, useEffect, useMemo, useState } from "react";
import type { Filter, Order } from "./types";
import { isBirthRow } from "./types";
import { BABIES } from "./data/babies";
import { MILESTONES } from "./data/milestones";
import { SITE } from "./data/site";
import { fmtDate } from "./lib/date";
import type { Criteria } from "./lib/milestones";
import {
  inView,
  isPlain,
  lastRecordDate,
  matchesFilter,
  matchesSearch,
  matchesTag,
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

  // 看誰以外的條件都只留在記憶體裡，不進網址：換個人看時不會帶著別人的篩選
  const [filter, setFilter] = useState<Filter>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState("");
  // 搜尋框開著沒有：提到這裡，「清除篩選」才能連搜尋框一起收起來
  const [searchOpen, setSearchOpen] = useState(false);
  const [order, setOrder] = useState<Order>(SITE.defaultOrder === "oldest" ? 1 : -1);
  const [photo, setPhoto] = useState<OpenPhoto | null>(null);

  const baby = view === "all" ? null : (byId[view] ?? null);

  // 整站主色跟著目前看的寶寶換
  useEffect(() => {
    const accent = baby ? baby.accent || SITE.accent : SITE.accent || "#8C7B6E";
    document.documentElement.style.setProperty("--accent", accent);
    document.title = `${baby ? `${baby.name}的` : ""}${SITE.title || "成長里程碑"}`;
  }, [baby]);

  // 目前檢視看得到的全部（還沒套標籤與搜尋）
  const viewPool = useMemo(
    () => items.filter((m) => inView(m, view, allIds)),
    [items, view, allIds],
  );

  // 切換看誰之後，標籤若在新範圍裡一筆都沒有就取消。
  // 在 render 期間調整 state 是 React 建議的作法，不會先畫出空白再跳回來。
  const [prevView, setPrevView] = useState(view);
  if (view !== prevView) {
    setPrevView(view);
    if (tag !== null && !viewPool.some((m) => m.tags.includes(tag))) setTag(null);
  }

  // 套上標籤與搜尋後的範圍：分類 chip 的筆數用這個算，所以 chip 會跟著搜尋縮減
  const pool = useMemo(
    () => viewPool.filter((m) => matchesTag(m, tag) && matchesSearch(m, q)),
    [viewPool, tag, q],
  );

  // 範圍變了之後，原本的分類篩選若一筆都沒有就退回「全部」，
  // 不然 chip 消失、列表空白，卻看不出是哪個篩選造成的。
  const [prevPool, setPrevPool] = useState(pool);
  if (pool !== prevPool) {
    setPrevPool(pool);
    if (filter !== null && !pool.some((m) => matchesFilter(m, filter))) setFilter(null);
  }

  const criteria = useMemo<Criteria>(() => ({ view, filter, tag, q }), [view, filter, tag, q]);
  const rows = useMemo(
    () => visibleRows(items, babies, allIds, criteria, order),
    [items, babies, allIds, criteria, order],
  );

  const shown = rows.filter((r) => !isBirthRow(r)).length;
  const countLabel = `${shown} 則${badCount ? `（${badCount} 筆格式有誤已略過）` : ""}`;
  const last = useMemo(() => lastRecordDate(items), [items]);

  const { sentinelRef, stuck } = useStuck();
  const closePhoto = useCallback(() => setPhoto(null), []);
  // 點卡片上的標籤：點已選的那個就取消
  const toggleTag = useCallback((t: string) => setTag((cur) => (cur === t ? null : t)), []);
  const clearAll = useCallback(() => {
    setFilter(null);
    setTag(null);
    setQ("");
    setSearchOpen(false);
  }, []);

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
          tag={tag}
          onTag={setTag}
          q={q}
          onQuery={setQ}
          searchOpen={searchOpen}
          onSearchOpen={setSearchOpen}
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
            tag={tag}
            onTag={toggleTag}
            filtered={!isPlain(criteria)}
            onClear={clearAll}
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
