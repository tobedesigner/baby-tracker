import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

interface Props {
  /** 同一筆里程碑的所有照片，已經是完整網址 */
  photos: string[];
  /** 一開始顯示第幾張 */
  start: number;
  alt: string;
  onClose: () => void;
}

/** Tab 只在對話框裡的按鈕之間循環，不會跑到底下的頁面 */
function trapTab(e: KeyboardEvent, box: HTMLElement | null) {
  if (!box) return;
  const focusables = Array.from(box.querySelectorAll<HTMLElement>("button"));
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === box)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * 點照片放大。點背景、按 ✕ 或 Esc 關掉；多張時可按左右鍵、左右箭頭或滑動切換。
 * 開著的時候焦點留在對話框裡，關掉後回到原本點的那張照片。
 */
export function Lightbox({ photos, start, alt, onClose }: Props) {
  const n = photos.length;
  const [i, setI] = useState(() => Math.min(Math.max(start, 0), n - 1));
  const boxRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const prev = useCallback(() => setI((k) => (k - 1 + n) % n), [n]);
  const next = useCallback(() => setI((k) => (k + 1) % n), [n]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    boxRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && n > 1) prev();
      else if (e.key === "ArrowRight" && n > 1) next();
      else if (e.key === "Tab") trapTab(e, boxRef.current);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [onClose, prev, next, n]);

  const stop = (fn: () => void) => (e: ReactMouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div
      ref={boxRef}
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} 照片`}
      tabIndex={-1}
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || n < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
      }}
    >
      <img src={photos[i]} alt={n > 1 ? `${alt}（第 ${i + 1} 張，共 ${n} 張）` : alt} />

      <button type="button" className="close" aria-label="關閉" onClick={stop(onClose)}>
        ✕
      </button>

      {n > 1 && (
        <>
          <button type="button" className="prev" aria-label="上一張" onClick={stop(prev)}>
            ‹
          </button>
          <button type="button" className="next" aria-label="下一張" onClick={stop(next)}>
            ›
          </button>
          <div className="count" aria-live="polite">
            {i + 1} / {n}
          </div>
        </>
      )}
    </div>
  );
}
