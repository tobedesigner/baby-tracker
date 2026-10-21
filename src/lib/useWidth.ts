import { useLayoutEffect, useRef, useState } from "react";

/**
 * 量一個元素目前的像素寬度，寬度變了（轉向、縮放視窗）就重新 render。
 * 還沒量到之前是 0，呼叫端自己給預設值。
 */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setWidth(node.getBoundingClientRect().width);
    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
