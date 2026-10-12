# 單一檔案 HTML 下載

[简体中文](README.md) · 繁體中文

| 檔案 | 使用方式 |
| --- | --- |
| [`archcase.html`](archcase.html) | 按兩下開啟；地圖執行所需函式庫與世界概覽資料從 jsDelivr 載入，失敗時嘗試 unpkg，需要連線。 |
| [`archcase-offline.html`](archcase-offline.html) | 按兩下開啟；執行所需函式庫、世界概覽與 221 個案例索引均內嵌，可離線使用。 |

兩版使用同一套案例資料與介面。案例主連結指向儲存庫內 MD 學習文件；可選原 Notion 來源可能需要權限。

案例庫內容以 [MD 文件](../../notes/README.zh-TW.md)提供；互動 HTML 是瀏覽這些內容的入口之一。MD 文件可直接閱讀或匯入 Notion、Obsidian 等工具。

離線版支援搜尋、分類、地圖標記、世界概覽、主題與語言切換。街道地圖、GitHub 案例全文、原 Notion 來源和周邊地圖仍需要連線。部分標記代表城市中心，請根據原始資料確認建築準確位置。

行動瀏覽器直接開啟本機 HTML 的能力因系統而異；手機使用可安裝的 [`網頁版`](../../web/README.zh-TW.md) 或 [`Android APK`](../../android/README.zh-TW.md) 更方便。

離線檔案由 `web/scripts/build-standalone.cjs` 產生，包含第三方授權聲明。修改地圖原始碼後，進入 `web/` 執行 `npm run build:standalone` 重新產生。
