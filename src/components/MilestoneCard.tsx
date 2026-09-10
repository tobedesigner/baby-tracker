import { useState } from "react";
import type { CSSProperties } from "react";
import type { Baby, Measures, Milestone, View } from "../types";
import { CATS } from "../lib/categories";
import { fmtRange, spanDays } from "../lib/date";
import { ageChips, dotColor } from "../lib/milestones";
import { assetUrl } from "../lib/asset";

interface Props {
  m: Milestone;
  view: View;
  multi: boolean;
  byId: Record<string, Baby>;
  allIds: string[];
  onOpenPhoto: (src: string, alt: string) => void;
}

const MEASURE_FIELDS: { key: keyof Measures; label: string; unit: string }[] = [
  { key: "height", label: "身高", unit: "cm" },
  { key: "weight", label: "體重", unit: "kg" },
  { key: "head", label: "頭圍", unit: "cm" },
];

export function MilestoneCard({ m, view, multi, byId, allIds, onOpenPhoto }: Props) {
  // 找不到的圖片直接收起來，不留破圖
  const [broken, setBroken] = useState<string[]>([]);

  const color = dotColor(m, view, byId);
  const chips = ageChips(m, view, byId, allIds);
  // 雙胞胎同一天生日，年齡完全一樣時併成一個，不要並排兩個相同數字
  const sameAge = chips.length > 1 && chips.every((c) => c.text === chips[0].text);

  const photos = m.photos.filter((src) => !broken.includes(src));
  const measures = m.measures
    ? MEASURE_FIELDS.filter((f) => {
        const v = m.measures![f.key];
        return v != null && (v as unknown) !== "";
      })
    : [];

  return (
    <article
      className={`item${m.highlight ? " hl" : ""}${m.end ? " range" : ""}`}
      style={color ? ({ "--c": color } as CSSProperties) : undefined}
    >
      <div className="card">
        <div className="top">
          <span className="date">{fmtRange(m.date, m.end)}</span>
          {m.end && <span className="dur">共 {spanDays(m.date, m.end)} 天</span>}

          {sameAge ? (
            <span className="age">
              {view === "all" && multi && !m.shared && (
                <b>{chips.map((c) => c.baby.name).join("・")}</b>
              )}
              {chips[0].text}
            </span>
          ) : (
            chips.map((c) => (
              <span
                key={c.baby.id}
                className="age"
                style={
                  view === "all" && multi
                    ? ({ "--wc": c.baby.accent || "var(--ink-2)" } as CSSProperties)
                    : undefined
                }
              >
                {view === "all" && multi && <b>{c.baby.name}</b>}
                {c.text}
              </span>
            ))
          )}

          {view === "all" && multi && m.shared && (
            <span className="age">
              <b>全家</b>
            </span>
          )}

          <span className="cat" style={{ "--cc": m.catColor } as CSSProperties}>
            <i />
            {CATS[m.cat].label}
          </span>
        </div>

        <h3>{m.title}</h3>
        {m.note && <p className="note">{m.note}</p>}

        {measures.length > 0 && (
          <div className="ms">
            {measures.map((f) => (
              <b key={f.key}>
                <em>{f.label}</em>
                {m.measures![f.key]} {f.unit}
              </b>
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <div className={`shots${photos.length === 1 ? " one" : ""}`}>
            {photos.map((src) => (
              <img
                key={src}
                src={assetUrl(src)}
                alt={m.title}
                loading="lazy"
                decoding="async"
                onClick={() => onOpenPhoto(assetUrl(src), m.title)}
                onError={() => setBroken((prev) => [...prev, src])}
              />
            ))}
          </div>
        )}

        {(m.place || m.people.length > 0 || m.tags.length > 0) && (
          <div className="foot">
            {m.place && <span className="tag where">{m.place}</span>}
            {m.people.map((p) => (
              <span key={p} className="tag who2">
                {p}
              </span>
            ))}
            {m.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
