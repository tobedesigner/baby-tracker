import type { RefObject } from "react";
import type { Baby, Filter, Milestone, Order, SiteConfig, View } from "../types";
import { AgePills } from "./AgePills";
import type { MonthOption } from "./Controls";
import { Controls } from "./Controls";
import { WhoSwitch } from "./WhoSwitch";

interface Props {
  site: SiteConfig;
  babies: Baby[];
  baby: Baby | null;
  multi: boolean;
  view: View;
  onView: (view: View) => void;
  pool: Milestone[];
  filter: Filter;
  onFilter: (filter: Filter) => void;
  tag: string | null;
  onTag: (tag: string | null) => void;
  q: string;
  onQuery: (q: string) => void;
  searchOpen: boolean;
  onSearchOpen: (open: boolean) => void;
  months: MonthOption[];
  onJump: (ym: string) => void;
  countLabel: string;
  order: Order;
  onToggleOrder: () => void;
  stuck: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

/** 桌機版固定在左邊、手機版在最上面的那一欄 */
export function Sidebar({
  site,
  babies,
  baby,
  multi,
  view,
  onView,
  pool,
  filter,
  onFilter,
  tag,
  onTag,
  q,
  onQuery,
  searchOpen,
  onSearchOpen,
  months,
  onJump,
  countLabel,
  order,
  onToggleOrder,
  stuck,
  sentinelRef,
}: Props) {
  return (
    <aside className="side">
      <header>
        <p className="hi">MILESTONES</p>
        <h1>{baby ? baby.name : site.title || "成長里程碑"}</h1>
        <p className="subtitle">{baby ? "" : site.subtitle || ""}</p>
        {multi && <WhoSwitch babies={babies} view={view} onChange={onView} />}
        <AgePills babies={baby ? [baby] : babies} showNames={!baby && multi} />
      </header>

      {/* 吸頂偵測用的空節點，被捲出畫面就代表篩選列吸住了 */}
      <div ref={sentinelRef} />

      <Controls
        pool={pool}
        filter={filter}
        onFilter={onFilter}
        tag={tag}
        onTag={onTag}
        q={q}
        onQuery={onQuery}
        searchOpen={searchOpen}
        onSearchOpen={onSearchOpen}
        months={months}
        onJump={onJump}
        countLabel={countLabel}
        order={order}
        onToggleOrder={onToggleOrder}
        stuck={stuck}
      />
    </aside>
  );
}
