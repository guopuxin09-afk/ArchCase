# ArchCase 網頁版

[简体中文](README.md) · 繁體中文

這是建築案例庫的互動瀏覽入口，提供可安裝網頁（PWA）與靜態網站原始碼。內容以 MD 文件提供：[案例分類](../notes/00%20Cases/README.zh-TW.md)、[建築師索引](../notes/01%20Architect/README.zh-TW.md)。MD 文件可直接在 GitHub 閱讀，也可依[文件使用與匯入說明](../notes/README.zh-TW.md)匯入 Notion、Obsidian 或其他 Markdown 工具。

## 使用

使用靜態伺服器開啟 `dist/`。PWA 安裝與離線快取需要 HTTPS 或 `localhost`。GitHub Pages 可以部署 `dist/`；所有應用程式資源使用相對路徑，也可部署在 `/ArchCase/` 這樣的子路徑。

```sh
cd web
npm ci
npm run build
python -m http.server 8080 --directory dist
```

開啟 `http://localhost:8080/`。建置僅需要 Node.js ≥ 22.12，不需要原作者的本機資料夾、帳號或專用託管服務。鎖定版本的第三方執行所需函式庫、世界概覽資料與圖示已放在 `assets/`，建置不會下載它們。

iPhone：用 Safari 開啟 HTTPS 網頁，點選“分享”→“加入主畫面”。支援安裝提示的其他瀏覽器可使用頁面上的“安裝”按鈕。瀏覽器可能清理離線快取；頁面安裝說明會顯示快取是否準備完成。

## 離線與連線範圍

首次成功開啟網頁並完成快取後，可離線搜尋案例、使用分類、檢視標記與世界概覽地圖。街道瓦片、GitHub 案例全文、可選的原 Notion 筆記和周邊地圖需要連線。PWA 不快取外部街道瓦片和筆記。

地圖保留 221 個案例和 12 個分類；其中旅館分類目前為空。座標沿用案例索引快照，部分代表城市中心，不能當作建築入口的精確定位。建築師、年代與分類也歡迎依據原始資料補充校正。

## 檔案與編輯入口

| 資料夾 | 用途 |
| --- | --- |
| `source/archcase-orange-glass.html` | 地圖介面、互動與內嵌案例索引的可編輯原始碼 |
| `scripts/` | PWA 建置、安裝介面和離線快取邏輯 |
| `assets/` | 鎖定版本的第三方資源、授權文件與預先產生的圖示 |
| `dist/` | 可直接託管的靜態網頁，已隨儲存庫提交 |
| `screenshots/` | 目前公開版本的桌面與行動瀏覽器截圖 |

編輯原始碼後執行 `npm run build`。案例主連結指向本儲存庫對應的 MD 文件，原 Notion 連結只作為可選來源保留，可能需要原工作空間的存取權限。若更名儲存庫或移動筆記，須同步修改內嵌案例 URL 與 URL 驗證規則。

單一檔案下載版在 [`../downloads/html/`](../downloads/html/README.zh-TW.md)。重新產生內嵌資源的離線 HTML：

```sh
npm run build:standalone
```

Android 專案使用同一版地圖原始碼的副本；更新資料時請同步兩個 `source/` 檔案，再分別建置。

## 第三方資源

Leaflet 1.9.4、Leaflet.markercluster 1.5.3、D3 Array 3.2.4、D3 Geo 3.1.1、TopoJSON Client 3.1.0、world-atlas 2.0.2 的原始授權文字保留在 `assets/licenses/` 與 `dist/licenses/`。世界概覽源於 Natural Earth；線上地圖保留各提供方署名。案例文件、外部圖片和資料的授權說明見儲存庫根目錄，第三方授權不隨專案程式碼授權變更。

## 驗證範圍

公開版本已完成 Node 建置與指令碼語法檢查，桌面和行動版 Chromium 瀏覽器檢查、221 個案例主連結檢查，以及在 `/ArchCase/` 子路徑完成快取後的實際斷網重新載入。瀏覽器驗證覆蓋搜尋、分類、主題、語言、詳細資料和世界概覽；它不能證明所有 Safari 版本與裝置行為相同。
