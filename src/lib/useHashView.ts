import { useCallback, useEffect, useState } from "react";
import type { Baby, SiteConfig, View } from "../types";

/** 開站時要看誰：網址 hash 優先，其次 site.ts 的 defaultView */
export function initialView(
  site: SiteConfig,
  byId: Record<string, Baby>,
  allIds: string[],
): View {
  let view: View =
    site.defaultView && (site.defaultView === "all" || byId[site.defaultView])
      ? site.defaultView
      : "all";

  const hash = readHash();
  if (hash === "all" || byId[hash]) view = hash;

  // 只有一個寶寶就不必有「全部」
  if (allIds.length <= 1) view = allIds[0] ?? "all";

  return view;
}

function readHash(): string {
  return (window.location.hash || "").replace(/^#/, "");
}

/**
 * view 與網址 hash 雙向同步：切換寶寶會改網址（#uwa），
 * 直接開 #uwa 或按上一頁也會跟著切。
 */
export function useHashView(
  initial: View,
  isValid: (v: string) => boolean,
): [View, (v: View) => void] {
  const [view, setViewState] = useState<View>(initial);

  useEffect(() => {
    const onHashChange = () => {
      const h = readHash();
      if (isValid(h)) setViewState(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [isValid]);

  const setView = useCallback((v: View) => {
    setViewState(v);
    if (history.replaceState) history.replaceState(null, "", `#${v}`);
    else window.location.hash = v;
  }, []);

  return [view, setView];
}
