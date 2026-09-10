import { useEffect, useRef, useState } from "react";

/**
 * 手機版篩選列吸頂後才畫下緣分隔線。
 * 作法是在篩選列前面放一個空 div，它被捲出畫面就代表吸住了。
 */
export function useStuck() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      setStuck(!entries[0].isIntersecting);
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return { sentinelRef, stuck };
}
