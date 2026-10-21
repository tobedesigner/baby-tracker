import type { View } from "../types";

/** 網址列的 ?m=<id>：分享單筆連結用，開站時讀一次 */
export function readTargetId(): string | null {
  return new URLSearchParams(window.location.search).get("m") || null;
}

/** 這一筆的分享連結：保留目前看誰（#uwa），看「全部」就不帶 hash */
export function permalink(id: string, view: View): string {
  const u = new URL(window.location.href);
  u.search = `?m=${encodeURIComponent(id)}`;
  u.hash = view === "all" ? "" : view;
  return u.toString();
}

/** 複製到剪貼簿；LINE 內建瀏覽器這類沒有 clipboard API 的環境退回舊方法 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* 往下用舊方法 */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
