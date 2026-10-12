# 單檔 HTML 下載

[简体中文](README.md) · 繁體中文 · [English](README.en.md)

**iPhone / iPad 建議：在 Safari 開啟[公開網頁版](https://archcase-iphone-atlas.cuddlyshell7.chatgpt.site)，透過「分享 → 加入主畫面」使用。**

| 檔案 | 使用方式 |
| --- | --- |
| [下載 archcase.html](https://github.com/guopuxin09-afk/ArchCase/releases/download/html-2026-10-13-ios/archcase.html) | 地圖程式、世界概覽與 221 個案例均內建；啟動後嘗試載入線上街道。街道服務無法連線時，仍可操作世界概覽。 |
| [下載 archcase-offline.html](https://github.com/guopuxin09-afk/ArchCase/releases/download/html-2026-10-13-ios/archcase-offline.html) | 預設使用內建世界概覽，不必等待連線。搜尋、分類、標記、詳情、語言與主題切換可離線使用；需要街道細節時點選「加载街道地图」。 |

連結會直接下載 HTML，不必複製原始碼或更改副檔名。電腦請用瀏覽器開啟。

iPhone / iPad 的檔案預覽可能不執行 JavaScript。新版會顯示不需指令碼的靜態世界地圖、221 個案例索引與「打开网页版」入口；靜態模式不支援搜尋、篩選或地圖拖曳。支援指令碼的本機 HTML 檢視器可執行互動版，但實際能力取決於該 App。

「世界概覽可用，目前無法連線街道服務」表示基礎地圖正常，線上街道服務未能連線。世界概覽只有國家輪廓，不包含離線街道。街道圖磚、GitHub 案例全文、原 Notion 筆記和周邊地圖需要連線。部分座標為城市中心，請核對原始資料。

兩版 HTML 的案例主要連結開啟本儲存庫的 Markdown 筆記。[公開網頁版](https://archcase-iphone-atlas.cuddlyshell7.chatgpt.site)是作者另外發佈的 PWA，其中原 Notion 筆記可能仍需相應存取權限。公開筆記也可从 [Markdown 文件](../../notes/README.md)直接閱讀或下載。

兩份檔案由 web/scripts/build-standalone.cjs 產生，包含第三方授權聲明。在 web/ 執行 npm run build:standalone 會同時更新兩份檔案。發佈時附加兩份檔案，並同步更新三語下載連結。

檢查範圍：桌面 Chromium、390px 手機與 820px 平板寬度、停用指令碼預覽、阻擋外部網路後的世界地圖與搜尋。不代表已完成 iPhone / iPad 實機測試。
