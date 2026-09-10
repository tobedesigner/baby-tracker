# 成長里程碑

雙寶共用的時間軸網頁，資料寫在純文字檔裡、用 git 版控，放上 GitHub Pages 後把網址傳給家人就能看。
React + TypeScript + Vite，推上 main 之後 GitHub Actions 會自動 build 並發佈，本機不必先 build。

三種版面會依螢幕寬度自動切換：

| 寬度 | 版面 |
|---|---|
| 手機（< 640px） | 單欄，篩選列吸在最上方跟著捲動 |
| 平板（640–999px） | 單欄加寬，字級與間距放大，照片一排三張 |
| 桌機（≥ 1000px） | 左側固定欄放名字、年齡與篩選，右側時間軸；捲動時左欄不動 |

深色模式跟著系統設定自動切換。

## 兩個寶寶怎麼分

**一條時間軸、每筆標記是誰**，不拆成兩個網站也不拆成兩份資料。

頁面上方有「全部／予安／予樂」切換：

- **全部**：兩個人的事混在一起依日期排。
- **單一寶寶**：只留有他的事，年齡用他的生日算，整站主色換成他的代表色。

每個檢視都有自己的網址：`.../#uwa`、`.../#una`。阿公只想看其中一個，就把那個網址存起來。

**雙胞胎特別處理**：兩人生日同一天時，年齡完全一樣的地方會自動併成一列（顯示「予安・予樂 7 個月又 3 天」），不會並排兩個一模一樣的數字。只跟其中一個有關的事照樣單獨顯示。

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

欄位打錯會在編輯器直接紅字（型別定義在 `src/types.ts`），漏了 `date` 或 `title` 的那一筆會被跳過，
筆數旁邊會標「N 筆格式有誤已略過」。

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
| `photos` | `["assets/photos/a.jpg"]` | 可多張，路徑從 `public/` 算起 |
| `measures` | `{ height: 62.5, weight: 6.8, head: 41.2 }` | 身高/體重/頭圍（公分、公斤） |
| `place` | `"台北"` | 地點 |
| `people` | `["爸爸", "媽媽"]` | 當天在場的大人 |
| `tags` | `["公托", "適應期"]` | 自由標籤 |
| `highlight` | `true` | 標成重點，卡片加強調並排進「重點」篩選 |

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

## 基本設定

- `src/data/babies.ts`：兩個寶寶的 id、名字、生日、代表色。加第三個就多一筆，切換鈕會自動多一個。
- `src/data/site.ts`：站名、副標、「全部」檢視的主色、預設排序與預設檢視。

`id` 是給程式和網址用的，取短一點的英文，**設定之後不要再改**（改了舊網址會失效）。

生日填了才會顯示年齡；不想公開確切生日就填 `null`，時間軸照常運作。

## 照片

放到 `public/assets/photos/`，檔名建議用日期開頭（`2026-09-09-first-day.jpg`）方便對照。
`public/` 底下的東西會原樣複製到網站根目錄，所以資料裡照樣寫 `assets/photos/2026-09-09-first-day.jpg`。
上傳前先縮到長邊 1600px 以內，手機開起來才快。
找不到的圖片會自動隱藏，不會出現破圖。

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
build 前會先跑型別檢查，型別有錯就不會發佈，線上維持前一版。

## 幾件事先知道

- **GitHub Pages 是公開網頁**，網址知道的人都看得到，也會被搜尋引擎索引。放照片、生日、就讀機構前先想一下。
- 想只給特定人看，就別放可識別的資訊：用小名、生日填 `null`、照片挑不露臉的。
- 真的需要權限控管的話，GitHub Pages 做不到；那要換成有登入機制的服務。

## 本機開發

需要 Node.js 20 以上。

```
npm install       只有第一次要跑
npm run dev       開發伺服器，改檔案畫面即時更新
npm run typecheck 只做型別檢查
npm run build     產出 dist/（平常交給 Actions 跑就好）
npm run preview   預覽 build 出來的結果
```

只是要加一筆里程碑的話，這些都不用跑：改 `src/data/milestones.ts` 然後 push 就好。

## 檔案結構

```
index.html                    Vite 進入點，只有一個 <div id="root">
src/main.tsx                  掛載 React
src/App.tsx                   狀態（看誰／篩選／排序）與版面組裝
src/types.ts                  資料欄位型別，改欄位從這裡開始

src/data/site.ts              站名、副標、主色、預設值
src/data/babies.ts            寶寶名單（id / 名字 / 生日 / 代表色）
src/data/milestones.ts        里程碑資料（兩個寶寶共用一份）

src/lib/date.ts               日期格式與年齡計算
src/lib/categories.ts         分類的名稱與顏色
src/lib/milestones.ts         資料正規化、篩選排序、生長曲線取點
src/lib/asset.ts              照片路徑補上部署 base
src/lib/useHashView.ts        看誰的狀態與網址 hash 同步
src/lib/useStuck.ts           手機版篩選列吸頂偵測

src/components/Sidebar.tsx    左欄：標題、寶寶切換、年齡、篩選
src/components/WhoSwitch.tsx  全部／予安／予樂
src/components/AgePills.tsx   現在幾歲（雙胞胎會併成一列）
src/components/Controls.tsx   分類篩選、筆數、排序切換
src/components/Timeline.tsx   依年份分段的時間軸
src/components/MilestoneCard.tsx  一筆里程碑的卡片
src/components/BirthCard.tsx  出生節點
src/components/GrowthCharts.tsx   生長曲線（SVG，沒有圖表套件）
src/components/Lightbox.tsx   照片放大

src/styles/                   樣式，index.css 匯入其餘五個
public/assets/photos/         照片
public/robots.txt             擋搜尋引擎
.github/workflows/deploy.yml  push 到 main 就自動 build 並發佈
```
