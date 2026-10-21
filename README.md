# 成長里程碑

雙寶共用的時間軸網頁，資料寫在純文字檔裡、用 git 版控，放上 GitHub Pages 後把網址傳給家人就能看。
React + TypeScript + Vite，推上 main 之後 GitHub Actions 會自動 build 並發佈，本機不必先 build。

三種版面會依螢幕寬度自動切換：

| 寬度 | 版面 |
|---|---|
| 手機（< 640px） | 單欄，篩選列吸在最上方跟著捲動，日期是一行「16 日 · 週五」，照片是滿版橫向膠卷 |
| 平板（640–999px） | 單欄加寬，日期變成左側的大數字欄，照片一排三張 |
| 桌機（≥ 1000px） | 三欄：左欄導覽固定、中欄時間軸、右欄月份索引固定並標示捲到哪個月，照片一排四張 |

版面是日記風：白底黑字、一個墨綠強調色、每筆之間只有細線，標題與日期用襯線體 Noto Serif TC。
字型從 Google Fonts 載入，只載粗體一個字重，載不到就退回系統字型，不影響閱讀。
深色模式跟著系統設定自動切換，寶寶的代表色會自動提亮。

## 兩個寶寶怎麼分

**一條時間軸、每筆標記是誰**，不拆成兩個網站也不拆成兩份資料。

頁面上方有「全部／予安／予樂」切換：

- **全部**：兩個人的事混在一起依日期排。
- **單一寶寶**：只留有他的事，年齡用他的生日算，整站主色換成他的代表色。

每個檢視都有自己的網址：`.../#uwa`、`.../#una`。阿公只想看其中一個，就把那個網址存起來。

**雙胞胎特別處理**：兩人生日同一天時，年齡完全一樣的地方會自動併成一列（顯示「予安・予樂 7 個月又 3 天」），不會並排兩個一模一樣的數字。只跟其中一個有關的事照樣單獨顯示。

## 找紀錄

篩選列有三種方式，可以疊著用，筆數會跟著縮：

- **分類 chip**：第一次、健康、出遊這些，再點一次取消；「★ 重點」只看標成 `highlight` 的。
- **標籤**：點卡片底下的標籤（例如「感冒」），只看同標籤的紀錄，篩選列最前面會出現一顆可取消的 chip。
- **搜尋**：點「搜尋」展開輸入框，比對標題、說明、備註、地點、在場的人與標籤。

這些條件只留在畫面上、不進網址。切換看誰時會保留，但在新範圍裡一筆都沒有的會自動取消。

時間軸依月份加了小標，篩選列的「跳到月份」可以直接跳過去；捲遠了右下角會出現回到最上面的按鈕。

## 分享單筆

每張卡片右上角有個連結圖示，點了就把這筆的網址複製到剪貼簿，貼到 LINE 給家人，開起來會直接捲到那筆並亮一下。
網址長這樣：`.../?m=2026-10-16-dh4zh#uwa`，後面的 `#uwa` 是當時看誰，看「全部」就沒有。

代號沒寫 `id` 就用日期加標題與人算出來，所以**改了標題或 who，舊連結就會失效**；想固定的那幾筆加 `id: "rsv"` 就好，`npm run check` 會擋重複的代號。

## 發展里程碑清單

時間軸下面有一份清單：翻身、坐、爬、長牙、走路這些常見項目，每項標常見月齡，雙寶各一格。
記錄到了就在那筆里程碑加 `milestone: "rollOver"`，清單會打勾並顯示達成時的年齡，點了跳到那筆；
今天的月齡落在常見範圍裡、還沒記錄的會標「差不多是時候」。
項目與代號在 `src/data/checklist.ts`，想加項目直接在陣列多一筆。月齡只是參考，早一點晚一點都正常。


## 加一筆里程碑

打開 `src/data/milestones.ts`，在陣列裡加一段：

```js
{
  date: "2026-09-09",
  title: "開始公托",
  who: ["uwa"],
  category: "care",
  note: "第一天送公托。",
  highlight: true,
},
```

`who` 三種寫法涵蓋所有情況：

| 寫法 | 意思 |
|---|---|
| `who: ["uwa"]` | 只有這個寶寶的事 |
| `who: ["uwa","una"]` | 兩個都有份，例如一起出遊 |
| 不寫 `who` | 全家共同的事，兩個寶寶的頁面都看得到 |

存檔後：

```
git add -A
git commit -m "2026-09-09 開始公托"
git push
```

推上去之後 Actions 會自動 build 並發佈，約一兩分鐘網站就更新了（進 repo 的 Actions 頁可以看進度）。
順序不用自己排，網頁會依日期排。

打包出來的 JS 與 CSS 檔名帶內容雜湊，改了什麼就換一個檔名，所以**部署完重新整理就看得到**。
只有 `index.html` 本身可能還停在瀏覽器快取，那按一次 Ctrl+Shift+R。

欄位打錯會在編輯器直接紅字（型別定義在 `src/types.ts`）。推上去前可以先跑 `npm run check`，
它會抓日期不存在、`who` 不是寶寶 id、分類打錯、結束日早於開始日、照片檔不存在這些網頁上看不出來的錯；
Actions 在 build 前也會跑同一支，有錯就不會發佈，線上維持前一版。
漏了 `date` 或 `title`、或 `who` 的 id 全部打錯的那一筆會被網頁跳過，筆數旁邊會標「N 筆格式有誤已略過」。

## 欄位

只有 `date` 與 `title` 必填，其餘都可以不寫。

| 欄位 | 範例 | 說明 |
|---|---|---|
| `date` | `"2026-09-09"` | 發生日期；跨天的事就是開始日 |
| `endDate` | `"2026-08-02"` | 結束日，只有跨天的事要寫（旅行、住院）。會顯示成「起 ～ 訖　共 N 天」，時間軸上的點也拉長成一小段 |
| `title` | `"開始公托"` | 一句話標題，短一點在手機上好看 |
| `who` | `["uwa"]` | 是誰的事，對應 `babies.js` 的 id；不寫＝全家共同 |
| `category` | `"care"` | 決定顏色與篩選鈕，見下表；沒寫歸到「日常」 |
| `note` | `"第一天只哭了五分鐘"` | 補充說明，`\n` 可換行 |
| `memo` | `"心疼"` | 備註：當下的心情或想說的話，顯示成左邊帶色條的便條 |
| `photos` | `["assets/photos/2026-09-09-first-day.webp"]` | 可多張，路徑從 `public/` 算起；用 `npm run photos` 產生，見下方「照片」 |
| `measures` | `{ height: 62.5, weight: 6.8, head: 41.2 }` | 身高/體重/頭圍（公分、公斤） |
| `place` | `"台北"` | 地點 |
| `people` | `["爸爸", "媽媽"]` | 當天在場的大人 |
| `tags` | `["公托", "適應期"]` | 自由標籤，點了只看同標籤的紀錄 |
| `highlight` | `true` | 標成重點，卡片加強調並排進「重點」篩選 |
| `id` | `"rsv"` | 分享連結用的固定代號，不寫就自動算；見「分享單筆」 |
| `milestone` | `"rollOver"` | 對應發展里程碑清單的代號，清單會打勾；代號在 `src/data/checklist.ts` |

分類 `category`：

| 值 | 顯示 | 適合放 |
|---|---|---|
| `first` | 第一次 | 第一次翻身、第一次叫爸爸、第一顆牙 |
| `growth` | 成長 | 量身高體重、換尺寸 |
| `health` | 健康 | 疫苗、健檢、生病復原 |
| `care` | 照護 | 公托、保母、換照顧安排 |
| `daily` | 日常 | 生活小事、有趣的反應 |
| `travel` | 出遊 | 第一次出門、旅行 |
| `holiday` | 節日 | 滿月、抓周、生日、過年 |

## 生長曲線

有填 `measures` 且累積兩筆以上就會自動畫出來，橫軸是**月齡不是日期**。

切到「全部」時兩個人會疊在同一張圖上，可以直接比同月齡誰比較高、比較重。

**量測請一筆一人**：`measures` 只算 `who` 剛好寫一個人的紀錄，寫兩個人或不寫的不會進圖，不然不知道數字是誰的。

點一下圓點會顯示那次的日期與數值，再點一下收起。

## 基本設定

- `src/data/babies.ts`：兩個寶寶的 id、名字、生日、代表色。加第三個就多一筆，切換鈕會自動多一個。
- `src/data/site.ts`：站名、副標、「全部」檢視的主色、預設排序與預設檢視。
- `src/styles/base.css`：整站色票、深色模式與字型，想換配色從這裡改。
- `src/data/checklist.ts`：發展里程碑清單的項目與常見月齡。
- `.env`：正式網址，分享到 LINE 的預覽圖要用絕對網址。搬到別的主機時改這裡。

`id` 是給程式和網址用的，取短一點的英文，**設定之後不要再改**（改了舊網址會失效）。

生日填了才會顯示年齡；不想公開確切生日就填 `null`，時間軸照常運作。

## 照片

原圖丟進專案根目錄的 `photos/`（jpg、png、webp、heic 都可以），然後跑：

```
npm run photos
```

會在 `public/assets/photos/` 產生長邊 1600px 的 WebP 加一張長邊 800px 的縮圖，依 EXIF 轉正、去掉 EXIF 與 GPS 位置，
檔名沒有日期開頭的會用拍攝日期補上，最後印出可以直接貼進 `milestones.ts` 的 `photos` 寫法。
`photos/` 不進 git，原圖留在手機或雲端備份就好；網站只放縮過的版本。

資料裡填 `assets/photos/<名稱>.webp` 就好，卡片會自動先載縮圖、點開才載大圖。
手動放進 `public/assets/photos/` 的圖也能用，只是沒有縮圖時手機會下載整張。
找不到的圖片會自動隱藏，不會出現破圖；`npm run check` 會把路徑打錯的那筆列出來。

iPhone 的 HEIC 解不開的話，先在「設定 → 相機 → 格式」選「最相容」，或匯出成 JPG 再放進來。

## 加到手機桌面

用手機瀏覽器開網站，選「加入主畫面」，就會像 app 一樣有自己的圖示、沒有瀏覽器的網址列。
圖示是兩個寶寶代表色的圓疊在一起，由 `npm run icons` 從 `site.ts` 與 `babies.ts` 產生；改了站名或代表色就重跑一次，產物在 `public/icons/`、`public/og.png`、`public/manifest.webmanifest`。
把網址貼到 LINE 時會顯示預覽圖，用的是同一組圖。

## 發佈到 GitHub Pages

1. 在 GitHub 建一個 repo（例如 `milestones`）。
2. 本機推上去：

   ```
   git remote add origin https://github.com/<帳號>/<repo>.git
   git branch -M main
   git push -u origin main
   ```

3. repo → Settings → Pages → Source 選 **GitHub Actions**（不是 Deploy from a branch）。
4. 第一次部署約兩三分鐘，網址是 `https://<帳號>.github.io/<repo>/`。

之後每次 `git push` 到 main，`.github/workflows/deploy.yml` 就會自動 build 並發佈，不需要再進設定。
build 前會先跑測試、型別檢查與資料檢查，任何一項有錯就不會發佈，線上維持前一版。

## 幾件事先知道

- **GitHub Pages 是公開網頁**，網址知道的人都看得到，也會被搜尋引擎索引。放照片、生日、就讀機構前先想一下。
- 想只給特定人看，就別放可識別的資訊：用小名、生日填 `null`、照片挑不露臉的。
- 真的需要權限控管的話，GitHub Pages 做不到；那要換成有登入機制的服務。

## 本機開發

需要 Node.js 22.18 以上（資料檢查與照片腳本直接用 Node 跑 .ts，不經過 Vite）。

```
npm install       只有第一次要跑
npm run dev       開發伺服器，改檔案畫面即時更新
npm run check     檢查資料有沒有打錯，推上去前跑這個就夠
npm run photos    把 photos/ 的原圖縮成網頁用的版本
npm run icons     站名或代表色改了之後重新產生 app 圖示與分享預覽圖
npm test          單元測試：日期、年齡、篩選的邏輯
npm run typecheck 只做型別檢查
npm run format    用 prettier 整理程式碼
npm run build     型別檢查 + 資料檢查 + 產出 dist/（平常交給 Actions 跑就好）
npm run preview   預覽 build 出來的結果
```

只是要加一筆里程碑的話，這些都不用跑：改 `src/data/milestones.ts` 然後 push 就好，頂多先跑一下 `npm run check`。

## 檔案結構

```
index.html                    Vite 進入點，只有一個 <div id="root">
src/main.tsx                  掛載 React
src/App.tsx                   狀態（看誰／篩選／排序）與版面組裝
src/types.ts                  資料欄位型別，改欄位從這裡開始

src/data/site.ts              站名、副標、主色、預設值
src/data/babies.ts            寶寶名單（id / 名字 / 生日 / 代表色）
src/data/milestones.ts        里程碑資料（兩個寶寶共用一份）
src/data/checklist.ts         發展里程碑清單的項目與常見月齡

src/lib/date.ts               日期格式與年齡計算
src/lib/categories.ts         分類的名稱與顏色
src/lib/milestones.ts         資料正規化、篩選排序、生長曲線取點
src/lib/asset.ts              照片路徑補上部署 base、縮圖檔名慣例
src/lib/useHashView.ts        看誰的狀態與網址 hash 同步
src/lib/useStuck.ts           手機版篩選列吸頂偵測
src/lib/useWidth.ts           量容器寬度，生長曲線用它讓圓點保持正圓
src/lib/id.ts                 分享連結的代號
src/lib/permalink.ts          讀寫 ?m= 與複製到剪貼簿
src/lib/checklist.ts          清單對每個寶寶的狀態
src/lib/*.test.ts             單元測試（vitest）

src/components/Sidebar.tsx    左欄：標題、寶寶切換、年齡、篩選
src/components/WhoSwitch.tsx  全部／予安／予樂
src/components/AgePills.tsx   現在幾歲與生日倒數（雙胞胎會併成一列）
src/components/Controls.tsx   分類篩選、標籤、搜尋、筆數、排序切換
src/components/Timeline.tsx   依年份分段的時間軸
src/components/MilestoneCard.tsx  一筆里程碑的卡片
src/components/BirthCard.tsx  出生節點
src/components/GrowthCharts.tsx   生長曲線（SVG，沒有圖表套件）
src/components/Lightbox.tsx   照片放大，多張可左右切換、鍵盤可操作
src/components/Checklist.tsx  發展里程碑清單
src/components/BackToTop.tsx  回到最上面

src/styles/                   樣式，index.css 匯入其餘六個
scripts/check-data.ts         資料檢查，npm run check
scripts/photos.ts             照片縮圖，npm run photos
scripts/icons.ts              app 圖示、分享預覽圖與 manifest，npm run icons
photos/                       照片原圖，不進 git
public/assets/photos/         縮好的照片
public/icons/ og.png manifest.webmanifest  npm run icons 的產物
.env                          正式網址，分享預覽圖用
public/robots.txt             擋搜尋引擎
docs/ROADMAP.md               後續規劃
.github/workflows/deploy.yml  push 到 main 就自動測試、檢查、build 並發佈
```
