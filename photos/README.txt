原圖放這裡（jpg、png、webp、heic、tiff、avif、gif 都可以），然後跑：

  npm run photos

會在 public/assets/photos/ 產生縮好的 WebP 與縮圖、去掉 EXIF（含 GPS），
並印出可以直接貼進 src/data/milestones.ts 的 photos 寫法。
這個資料夾不進 git，原圖留在手機或雲端備份就好。
