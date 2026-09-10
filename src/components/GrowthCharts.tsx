import { Fragment } from "react";
import type { Baby, Measures, Milestone, View } from "../types";
import type { GrowthPoint } from "../lib/milestones";
import { seriesFor } from "../lib/milestones";
import { fmtDate } from "../lib/date";

interface Spec {
  key: keyof Measures;
  label: string;
  unit: string;
}

const SPECS: Spec[] = [
  { key: "height", label: "身高", unit: "cm" },
  { key: "weight", label: "體重", unit: "kg" },
];

const W = 260;
const H = 96;
const PAD = 6;

interface Series {
  baby: Baby;
  pts: GrowthPoint[];
}

interface Props {
  items: Milestone[];
  babies: Baby[];
  view: View;
  byId: Record<string, Baby>;
}

/** 生長曲線。橫軸是月齡不是日期，所以看「全部」時兩個人可以疊著比。 */
export function GrowthCharts({ items, babies, view, byId }: Props) {
  const who = view === "all" ? babies : [byId[view]].filter(Boolean);

  const charts = SPECS.map((spec) => ({
    spec,
    // 只有兩筆以上才畫得出線
    sets: who
      .map((baby) => ({ baby, pts: seriesFor(items, baby, spec.key) }))
      .filter((s) => s.pts.length >= 2),
  })).filter((c) => c.sets.length > 0);

  if (!charts.length) return null;

  return (
    <section className="growth">
      <h2>生長紀錄</h2>
      <p className="hint">
        {who.length > 1 ? "橫軸是月齡，兩個人疊在一起就能比同月齡的差別。" : "橫軸是月齡。"}
        點圓點看當次數值。
      </p>
      <div className="charts">
        {charts.map((c) => (
          <Chart key={c.spec.key} spec={c.spec} sets={c.sets} />
        ))}
      </div>
    </section>
  );
}

function Chart({ spec, sets }: { spec: Spec; sets: Series[] }) {
  const xs = sets.flatMap((s) => s.pts.map((p) => p.x));
  const vs = sets.flatMap((s) => s.pts.map((p) => p.v));
  const x0 = Math.min(...xs);
  const v0 = Math.min(...vs);
  // 只有一個 x（或 v）時給它一點寬度，免得除以零
  const x1 = Math.max(...xs) === x0 ? x0 + 1 : Math.max(...xs);
  const v1 = Math.max(...vs) === v0 ? v0 + 1 : Math.max(...vs);

  const sx = (x: number) => PAD + ((x - x0) / (x1 - x0)) * (W - PAD * 2);
  const sy = (v: number) => H - PAD - ((v - v0) / (v1 - v0)) * (H - PAD * 2);
  const line = (pts: GrowthPoint[]) => pts.map((p) => `${sx(p.x)},${sy(p.v)}`).join(" ");

  const solo = sets.length === 1;

  return (
    <div className="chart">
      <div className="ct">
        <h4>{spec.label}</h4>
        {solo && (
          <span style={{ color: sets[0].baby.accent || "var(--accent)" }}>
            {sets[0].pts[sets[0].pts.length - 1].v} {spec.unit}
          </span>
        )}
      </div>

      {!solo && (
        <div className="lg">
          {sets.map((s) => (
            <span key={s.baby.id}>
              <i style={{ background: s.baby.accent || "var(--accent)" }} />
              {s.baby.name}{" "}
              <b>
                {s.pts[s.pts.length - 1].v} {spec.unit}
              </b>
            </span>
          ))}
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {sets.map((s) => {
          const color = s.baby.accent || "#E08A6E";
          const last = s.pts[s.pts.length - 1];
          return (
            <Fragment key={s.baby.id}>
              {solo && (
                <polygon
                  points={`${line(s.pts)} ${sx(last.x)},${H} ${sx(s.pts[0].x)},${H}`}
                  fill={color}
                  opacity=".10"
                />
              )}
              <polyline
                points={line(s.pts)}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {s.pts.map((p) => (
                <circle
                  key={`${p.d.getTime()}-${p.v}`}
                  cx={sx(p.x)}
                  cy={sy(p.v)}
                  r="2.6"
                  fill="var(--surface)"
                  stroke={color}
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{`${s.baby.name}　${fmtDate(p.d)}　${p.v} ${spec.unit}`}</title>
                </circle>
              ))}
            </Fragment>
          );
        })}
      </svg>

      <div className="xl">
        <span>{Math.round(x0)} 個月</span>
        <span>{Math.round(x1)} 個月</span>
      </div>
    </div>
  );
}
