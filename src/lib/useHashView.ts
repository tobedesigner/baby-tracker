import { useCallback, useEffect, useState } from "react";
import type { Baby, SiteConfig, View } from "../types";

/** 網址沒帶 hash 時要看誰：site.ts 的 defaultView；只有一個寶寶就直接看他 */
export function defaultView(
  site: SiteConfig,
  byId: Record<string, Baby>,
  allIds: string[],
): View {
  // 只有一個寶寶就不必有「全部」
  if (allIds.length <= 1) return allIds[0] ?? "all";
  return site.defaultView && (site.defaultView === "all" || byId[site.defaultView])
    ? site.defaultView
    : "all";
}

function readHash(): string {
  return (window.location.hash || "").replace(/^#/, "");
}

/**
 * view 與網址 hash 雙向同步：切換寶寶會改網址（#uwa）並留一筆歷史，
 * 直接開 #uwa 或按上一頁／下一頁也會跟著切。
 */
export function useHashView(
  fallback: View,
  isValid: (v: string) => boolean,
): [View, (v: View) => void] {
  const [view, setViewState] = useState<View>(() => {
    const h = readHash();
    return isValid(h) ? h : fallback;
  });

  useEffect(() => {
    const onHashChange = () => {
      const h = readHash();
      // 上一頁退回沒有 hash 的網址時，回到預設檢視
      const v = h === "" ? fallback : h;
      if (isValid(v)) setViewState(v);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [isValid, fallback]);

  const setView = useCallback((v: View) => {
    setViewState(v);
    // pushState 不會觸發 hashchange，所以上面同步設了 state；
    // 留歷史紀錄是為了讓上一頁能切回前一個檢視
    if (readHash() !== v) history.pushState(null, "", `#${v}`);
  }, []);

  return [view, setView];
}
