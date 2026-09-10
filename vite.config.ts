import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 相對路徑：GitHub Pages 的專案頁掛在 /<repo>/ 底下，
  // 用 "./" 就不必把 repo 名字寫死在設定檔裡。
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    // 照片本來就在 public/，不需要再把小圖 inline 成 base64
    assetsInlineLimit: 0,
  },
});
