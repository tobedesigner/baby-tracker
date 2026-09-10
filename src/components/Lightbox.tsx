import { useEffect } from "react";

interface Props {
  src: string | null;
  alt: string;
  onClose: () => void;
}

/** 點照片放大。點任何地方或按 Esc 關掉。 */
export function Lightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    if (!src) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [src, onClose]);

  return (
    <div className={`lb${src ? " on" : ""}`} onClick={onClose}>
      {src && <img src={src} alt={alt} />}
    </div>
  );
}
