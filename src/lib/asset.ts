/** 照片路徑以 public/ 為基準（"assets/photos/a.jpg"），這裡補上部署時的 base */
export function assetUrl(src: string): string {
  if (isExternal(src) || src.startsWith("/")) return src;
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/") ? base + src : `${base}/${src}`;
}

/** 縮圖的檔名慣例：a.webp → a.thumb.webp，npm run photos 會一起產生。外部網址或沒副檔名就原樣回傳 */
export function thumbOf(src: string): string {
  if (isExternal(src)) return src;
  const m = src.match(/^(.*)(\.[a-z0-9]+)$/i);
  return m ? `${m[1]}.thumb${m[2]}` : src;
}

function isExternal(src: string): boolean {
  return /^(https?:)?\/\//.test(src) || src.startsWith("data:");
}
