import { useEffect, useRef } from "react";
import type { CategoryKey, Filter, Milestone, Order } from "../types";
import { CATEGORY_KEYS, CATS } from "../lib/categories";

export interface MonthOption {
  ym: string;
  label: string;
  /** 這個月有幾筆 */
  n: number;
}

interface Props {
  /** 目前檢視、標籤與搜尋都套完後看得到的里程碑，用來算每個分類的筆數 */
  pool: Milestone[];
  filter: Filter;
  onFilter: (filter: Filter) => void;
  tag: string | null;
  onTag: (tag: string | null) => void;
  q: string;
  onQuery: (q: string) => void;
  searchOpen: boolean;
  onSearchOpen: (open: boolean) => void;
  /** 時間軸裡有的月份，給「跳到」用 */
  months: MonthOption[];
  onJump: (ym: string) => void;
  countLabel: string;
  order: Order;
  onToggleOrder: () => void;
  stuck: boolean;
}

/** 分類篩選 + 標籤 + 搜尋 + 跳到月份 + 筆數 + 排序切換。手機版會吸在畫面最上方，搜尋框只在打開時佔空間。 */
export function Controls({
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
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);
  const closeSearch = () => {
    onQuery("");
    onSearchOpen(false);
  };

  const counts = {} as Record<CategoryKey, number>;
  pool.forEach((m) => {
    counts[m.cat] = (counts[m.cat] ?? 0) + 1;
  });
  const highlightCount = pool.filter((m) => m.highlight).length;

  const chips: { key: Filter; label: string; color?: string; n: number }[] = [
    { key: null, label: "全部", n: pool.length },
  ];
  if (highlightCount) chips.push({ key: "hl", label: "★ 重點", n: highlightCount });
  CATEGORY_KEYS.forEach((k) => {
    if (counts[k]) chips.push({ key: k, label: CATS[k].label, color: CATS[k].color, n: counts[k] });
  });

  return (
    <div className={`controls${stuck ? " stuck" : ""}`}>
      <div className="chips">
        {tag !== null && (
          <button
            type="button"
            className="chip tagchip"
            aria-pressed="true"
            title="取消標籤篩選"
            onClick={() => onTag(null)}
          >
            #{tag}
            <span className="x" aria-hidden="true">
              ✕
            </span>
          </button>
        )}
        {chips.map((c) => (
          <button
            key={c.key ?? "all"}
            type="button"
            className="chip"
            aria-pressed={filter === c.key}
            onClick={() => onFilter(filter === c.key ? null : c.key)}
          >
            {c.color && <span className="dot" style={{ background: c.color }} />}
            {c.label}
            <span className="n">{c.n}</span>
          </button>
        ))}
      </div>

      {searchOpen && (
        <div className="search">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSearch();
            }}
            placeholder="搜尋標題、說明、地點、標籤"
            aria-label="搜尋里程碑"
            enterKeyHint="search"
            autoComplete="off"
          />
          <button type="button" className="x" aria-label="關閉搜尋" onClick={closeSearch}>
            ✕
          </button>
        </div>
      )}

      <div className="meta-row">
        <span>{countLabel}</span>
        <span className="actions">
          {months.length > 1 && (
            <select
              className="jump"
              aria-label="跳到月份"
              value=""
              onChange={(e) => {
                if (e.target.value) onJump(e.target.value);
              }}
            >
              <option value="">跳到月份</option>
              {months.map((mo) => (
                <option key={mo.ym} value={mo.ym}>
                  {mo.label}
                </option>
              ))}
            </select>
          )}
          {!searchOpen && (
            <button className="iconbtn" type="button" onClick={() => onSearchOpen(true)}>
              <SearchIcon />
              <span>搜尋</span>
            </button>
          )}
          <button className="sortbtn" type="button" onClick={onToggleOrder}>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M4 3v10M4 13l-2.2-2.4M4 13l2.2-2.4M11 13V3M11 3L8.8 5.4M11 3l2.2 2.4" />
            </svg>
            <span>{order === -1 ? "新的在上" : "舊的在上"}</span>
          </button>
        </span>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}
