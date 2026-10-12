# 程式碼導讀與註解說明

[简体中文](code-guide.md) · [繁體中文](code-guide.zh-TW.md)

這份導讀說明專案自行編寫的程式碼、建置流程與既有註解的用意。程式碼由 OpenAI Codex 產生並協助迭代；閱讀這份說明時，仍以實際原始碼和測試結果為準。第三方程式碼與原始授權文字保持原樣。

## 先找對編輯入口

| 檔案 | 負責什麼 | 更新時注意 |
| --- | --- | --- |
| [`web/source/archcase-orange-glass.html`](../web/source/archcase-orange-glass.html) | 地圖介面、搜尋分類、主題、語言、案例詳細資訊與內嵌索引 | 案例資料在 `archcase-data` JSON；更新 Markdown 不會自動更新此索引。 |
| [`web/scripts/build.cjs`](../web/scripts/build.cjs) | 把 HTML、安裝介面、圖示與本機執行資源組合成 PWA | 產生 `web/dist/`，不要直接在產生的網頁裡修改功能。 |
| [`web/scripts/build-standalone.cjs`](../web/scripts/build-standalone.cjs) | 將函式庫、樣式、世界概覽與授權文字內嵌成離線單檔 HTML | 輸出 `downloads/html/archcase-offline.html`；不包含離線街道或案例全文。 |
| [`web/scripts/pwa.js`](../web/scripts/pwa.js) | 安裝說明、快取狀態、可用更新及視窗高度 | 要配合產生的 HTML 元素 ID；支援 HTTPS 或 `localhost` 的 Service Worker。 |
| [`web/scripts/sw-template.js`](../web/scripts/sw-template.js) | 應用程式本身的離線快取 | 建置時填入資源清單與版本雜湊；不快取外部街道圖磚或筆記。 |
| [`android/source/archcase-orange-glass.html`](../android/source/archcase-orange-glass.html) | Android 使用的同版地圖原始碼副本 | 更新地圖時，請與網頁版副本同步。 |
| [`android/scripts/integrate-archcase.mjs`](../android/scripts/integrate-archcase.mjs) | 改用本機函式庫與世界底圖，加入原生適配，複製授權聲明 | 產生 `android/web/index.html`；Vite 再將它建置到 `android/www/`。 |
| [`android/web/native.css`](../android/web/native.css)、[`native.js`](../android/web/native.js) | 系統列安全區域、鍵盤視窗、主題與 Android 返回鍵 | 修改後需要重新同步、編譯 APK；瀏覽器檢查不能取代真機驗證。 |

## 建置註解在說什麼

PWA 與 Android 的建置腳本會尋找指定的原始碼片段再替換。`replaceOnce` 用來檢查預期位置仍存在，避免 HTML 結構改變後套用了錯誤修改。若改動了資源載入函式、安裝介面或重要標記，需要一起調整腳本中的對應片段。

建置腳本也會解析內嵌案例 JSON，檢查打包前後資料沒有意外改變，並用 Node `vm.Script` 檢查一般行內 JavaScript 的語法。這些檢查有助於發現產生過程的問題，不能證明案例事實或所有互動行為都正確。

地圖裡關於拼音排序的註解，說明中文拼音鍵與拉丁字母名稱如何一起排序；主題色彩註解則說明分類色彩使用 CSS 變數，讓明暗切換可以調整對比。Android 樣式註解說明地圖與面板需避開系統列及螢幕缺口，並減少觸控拖曳時意外選取文字。

## 離線快取與版本

PWA 建置會從輸出資源內容計算版本雜湊，填入 Service Worker 的快取名稱。使用者開啟網站並完成快取後，頁面可以從同一份快取取得應用程式介面、世界概覽與案例索引。更新按鈕啟用新 Worker 後會重新載入頁面；舊版 ArchCase 快取會在啟用流程中清理。

外部街道地圖、GitHub 筆記與 Notion 來源不在此快取範圍內。瀏覽器也可能自行清除離線資料，因此「已安裝」不代表內容永久保存。

## 案例連結與 URL 驗證

每個案例的 `url` 是本儲存庫 Markdown 筆記的公開連結，`notePath` 記錄相對路徑，`notionUrl` 保留可選的原 Notion 來源。案例名稱要對應真實檔名；空格與中文等路徑字元需要正確編碼。

`publicNoteUrls` 從內嵌案例索引建立確切的允許清單。`safeUrl` 要求 HTTPS，排除帳號密碼與自訂連接埠；GitHub 案例連結還需符合允許清單，且不能帶查詢參數或片段。可選的 Notion 來源使用限定網域的 HTTPS 連結，是否能開啟仍取決於 Notion 權限。

換用自己的儲存庫時，請更新索引中的 `url`、`notePath` 與 `repository`，同步網頁和 Android 副本，再檢查實際的詳細資訊連結。不要為了讓失效連結通過而移除驗證。

## Android 的安全區域與更新位置

`native.css` 透過 CSS 變數處理四邊安全區域；`native.js` 會配合明暗主題調整系統列顯示、追蹤可見視窗高度，並在按返回鍵時優先關閉案例預覽或詳細資訊，再處理輸入焦點、歷史紀錄或離開應用程式。實際鍵盤、手勢、系統列與外部連結開啟效果需要 Android 裝置確認。

| 想改什麼 | 更新位置 |
| --- | --- |
| 案例名稱、年代、分類、座標與連結 | 兩份 `source/archcase-orange-glass.html` 的 `archcase-data` |
| PWA 名稱、圖示與離線資源 | `web/scripts/build.cjs`、`web/assets/`；重新執行網頁建置 |
| Android 名稱與套件識別碼 | `android/capacitor.config.json` 與原生專案中的對應設定；現有 Java 套件與 namespace 也要一致 |
| APK 版本 | `android/android/app/build.gradle` 的 `versionCode`、`versionName`；另同步 npm 專案版本與下載說明 |
| 新的 APK 與校驗資訊 | `android/apk/`；重新編譯、驗證簽章、資源一致性及 SHA-256 |

網站建置：在 `web/` 執行 `npm run build`；離線 HTML：`npm run build:standalone`。Android 建置環境與命令詳見 [`android/README.zh-TW.md`](../android/README.zh-TW.md)。只讀筆記或使用現成下載檔時，不需要編譯。

## 修改後如何檢查

先確認案例 JSON 能解析、名稱與筆記檔案一一對應，再進行建置及必要的語法檢查。實際打開頁面檢查搜尋、篩選、語言、主題、詳細資訊與主連結；確認桌面、直向手機和橫向手機沒有版面溢出。需要離線使用時，測試斷網重載或內嵌資源版本，不要只根據「沒有外部 script 標籤」判斷。

APK 需檢查簽章、版本資訊及打包資源與網頁建置結果是否一致，再補上裝置驗證。已完成的公開版本檢查與限制見[檢查紀錄](publication-checks.zh-TW.md)。
