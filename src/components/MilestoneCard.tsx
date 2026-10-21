import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Baby, Measures, Milestone, View } from "../types";
import { CATS } from "../lib/categories";
import { fmtEnd, spanDays, weekdayLong } from "../lib/date";
import { ageChips, dotColor } from "../lib/milestones";
import { assetUrl, thumbOf } from "../lib/asset";
import { copyText, permalink } from "../lib/permalink";

interface Props {
  m: Milestone;
  view: View;
  multi: boolean;
  byId: Record<string, Baby>;
  allIds: string[];
  tag: string | null;
  onTag: (tag: string) => void;
  /** 從分享連結或清單跳過來的那一筆：捲過去並強調 */
  isTarget: boolean;
  targetN: number;
  onOpenPhoto: (photos: string[], index: number, alt: string) => void;
}

const MEASURE_FIELDS: { key: keyof Measures; label: string; unit: string }[] = [
  { key: "height", label: "身高", unit: "cm" },
  { key: "weight", label: "體重", unit: "kg" },
  { key: "head", label: "頭圍", unit: "cm" },
];

export function MilestoneCard({
  m,
  view,
  multi,
  byId,
  allIds,
  tag,
  onTag,
  isTarget,
  targetN,
  onOpenPhoto,
}: Props) {
  // 卡片先載縮圖（a.thumb.webp），沒有縮圖就退回原圖，原圖也沒有就整張收起來不留破圖
  const [noThumb, setNoThumb] = useState<string[]>([]);
  const [broken, setBroken] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isTarget || !ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isTarget, targetN]);

  const share = async () => {
    const url = permalink(m.id, view);
    const ok = await copyText(url);
    if (!ok) {
      window.prompt("複製這個連結：", url);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

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
      ref={ref}
      id={`m-${m.id}`}
      className={`item${m.highlight ? " hl" : ""}${m.end ? " range" : ""}${isTarget ? " target" : ""}`}
      style={color ? ({ "--c": color } as CSSProperties) : undefined}
    >
      {/* 日期：月份已經在章節標題，這裡只放日與星期；平板以上變成左側的數字欄 */}
      <div className="day">
        <b>{m.date.getDate()}</b>
        <span>{weekdayLong(m.date)}</span>
      </div>

      <div className="card">
        <div className="top">
          {m.end && (
            <span className="dur">
              ～ {fmtEnd(m.date, m.end)}・共 {spanDays(m.date, m.end)} 天
            </span>
          )}

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

          <span className="end">
            <span className="cat" style={{ "--cc": m.catColor } as CSSProperties}>
              <i />
              {CATS[m.cat].label}
            </span>
            <button
              type="button"
              className="share"
              aria-label="複製這筆的連結"
              title="複製連結"
              onClick={share}
            >
              {copied ? (
                "已複製"
              ) : (
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6.5 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1" />
                  <path d="M9.5 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1" />
                </svg>
              )}
            </button>
          </span>
        </div>

        <h3>{m.title}</h3>
        {m.note && <p className="note">{m.note}</p>}
        {m.memo && <p className="memo">{m.memo}</p>}

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
            {photos.map((src, idx) => {
              const useFull = noThumb.includes(src) || thumbOf(src) === src;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => onOpenPhoto(photos.map(assetUrl), idx, m.title)}
                >
                  <img
                    src={assetUrl(useFull ? src : thumbOf(src))}
                    alt={m.title}
                    loading="lazy"
                    decoding="async"
                    onError={() => {
                      if (useFull) setBroken((prev) => [...prev, src]);
                      else setNoThumb((prev) => [...prev, src]);
                    }}
                  />
                </button>
              );
            })}
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
              <button
                key={t}
                type="button"
                className="tag"
                aria-pressed={tag === t}
                title={tag === t ? "取消標籤篩選" : `只看「${t}」`}
                onClick={() => onTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
