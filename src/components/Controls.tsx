import type { CategoryKey, Filter, Milestone, Order } from "../types";
import { CATEGORY_KEYS, CATS } from "../lib/categories";

interface Props {
  /** 目前檢視看得到的里程碑，用來算每個分類的筆數 */
  pool: Milestone[];
  filter: Filter;
  onFilter: (filter: Filter) => void;
  countLabel: string;
  order: Order;
  onToggleOrder: () => void;
  stuck: boolean;
}

/** 分類篩選 + 筆數 + 排序切換。手機版會吸在畫面最上方。 */
export function Controls({
  pool,
  filter,
  onFilter,
  countLabel,
  order,
  onToggleOrder,
  stuck,
}: Props) {
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

      <div className="meta-row">
        <span>{countLabel}</span>
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
      </div>
    </div>
  );
}
