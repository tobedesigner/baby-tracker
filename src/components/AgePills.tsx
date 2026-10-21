import type { CSSProperties } from "react";
import type { Baby } from "../types";
import { ageText, fmtShort, nextBirthday, today } from "../lib/date";

interface Props {
  babies: Baby[];
  /** 看「全部」且有多個寶寶時才需要標名字 */
  showNames: boolean;
}

/** 「距離 1 歲生日還有 108 天」「今天滿 1 歲 🎂」 */
function countdownText(bd: Date, now: Date): string {
  const c = nextBirthday(bd, now);
  if (c.days === 0) return `今天滿 ${c.years} 歲 🎂`;
  if (c.years === 0) return `距離出生還有 ${c.days} 天`;
  return `距離 ${c.years} 歲生日還有 ${c.days} 天`;
}

/** 現在幾歲。雙胞胎同一天生日就併成一列，不要兩列一模一樣的年齡。 */
export function AgePills({ babies, showNames }: Props) {
  const show = babies.filter((b) => b.bd);
  if (!show.length) return <div className="ages" />;

  const now = today();
  const twins = show.length > 1 && show.every((b) => b.bd!.getTime() === show[0].bd!.getTime());

  if (twins) {
    return (
      <>
        <div className="ages">
          <div className="agepill">
            <span className="who">{show.map((b) => b.name).join("・")}</span>
            <b>{ageText(show[0].bd, now)}</b>
            <span className="bd">生日 {fmtShort(show[0].bd!)}</span>
          </div>
        </div>
        <div className="countdown">
          <span>{countdownText(show[0].bd!, now)}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="ages">
        {show.map((b) => (
          <div
            key={b.id}
            className="agepill"
            style={{ "--wc": b.accent || "var(--accent)" } as CSSProperties}
          >
            {showNames && <span className="who">{b.name}</span>}
            <b>{ageText(b.bd, now)}</b>
            <span className="bd">生日 {fmtShort(b.bd!)}</span>
          </div>
        ))}
      </div>
      <div className="countdown">
        {show.map((b) => (
          <span key={b.id} style={{ "--wc": b.accent || "var(--accent)" } as CSSProperties}>
            {showNames && <b>{b.name}</b>}
            {countdownText(b.bd!, now)}
          </span>
        ))}
      </div>
    </>
  );
}
