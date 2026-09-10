/** 照片路徑以 public/ 為基準（"assets/photos/a.jpg"），這裡補上部署時的 base */
export function assetUrl(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/") || src.startsWith("data:")) return src;
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/") ? base + src : `${base}/${src}`;
}
