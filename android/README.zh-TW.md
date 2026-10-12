# ArchCase Android

[简体中文](README.md) · 繁體中文 · [English](README.en.md)

將建築案例地圖封裝為 Capacitor Android 應用程式。保留 221 個案例、12 個分類、搜尋篩選、地圖群聚、中英切換與深淺主題。案例主連結指向本儲存庫的 MD 學習文件；可選原 Notion 來源可能需要權限。

MD 學習文件是案例庫的內容，APK 是瀏覽地圖與索引的一種形式。文件集中在 [`notes/`](../notes/README.zh-TW.md)，可下載後匯入 Notion、Obsidian 等工具；APK 不會把外部全文與圖片自動下載到手機。

## 安裝包

- [下載 archcase-debug.apk](https://github.com/guopuxin09-afk/ArchCase/raw/refs/heads/main/android/apk/archcase-debug.apk)：版本 `1.0.1`，versionCode `2`，套件名稱 `com.archcase.atlas`。
- [`apk/archcase-debug.apk.sha256`](apk/archcase-debug.apk.sha256)：檔案 SHA-256，可用於驗證下載檔案的完整性。
- 最低 Android 7.0（API 24）；目標 Android 16（API 36）。

1. 用 Android 手機瀏覽器點選上方 **下載 archcase-debug.apk**，等待下載完成。
2. 從瀏覽器的下載清單或手機檔案管理器開啟 `archcase-debug.apk`。
3. 如果系統提示不允許此來源安裝應用程式，依提示進入設定，允許目前的瀏覽器或檔案管理器安裝應用程式，再返回安裝頁面。不同手機的選項名稱可能不同。
4. 點選 **安裝**，完成後點選 **開啟**，或在應用程式清單中開啟 **ArchCase**。

這是簽章驗證通過的 Debug 測試安裝包，尚未使用正式發行簽章，也未上架應用程式商店。若手機已有使用不同偵錯簽章的舊版，系統可能要求先解除安裝舊版再安裝；解除安裝會清除舊版的本機應用程式資料。安裝完成後，可以在系統設定中關閉該來源的安裝權限。

## 離線與連線

APK 內建地圖介面、全部案例索引、地圖執行所需函式庫和 Natural Earth 世界概覽，首次啟動不必下載這些資源。斷網可用搜尋、分類、標記與群聚、世界概覽、詳細資料索引、主題和語言切換。線上街道瓦片、GitHub 案例全文、原 Notion 來源與周邊地圖需要連線。

它不包含離線街道或建築輪廓。部分案例座標代表城市中心；索引只是查找入口，年代、建築師、分類和地點請繼續與原始資料核對。

## 建置

要求 Node.js ≥ 22.12、JDK 21、Android SDK API 36 與 Build Tools 36.0.0。npm 相依套件固定在 `package-lock.json`。Android Studio 使用者可使用已設定的 `JAVA_HOME`、`ANDROID_HOME`：

```sh
cd android
npm ci
npm run sync:android
cd android
./gradlew assembleDebug
```

Windows 完整設定與驗證指令碼：

```powershell
npm.cmd run setup:android
npm.cmd run doctor
npm.cmd run apk:debug
```

`setup:android` 會連線下載 JDK/SDK、驗證官方歸檔雜湊值並安裝相依套件。`apk:debug` 會產生網頁、檢查本機靜態資源、同步 Capacitor、編譯 APK、驗證簽章，並逐一比較 APK 內資源與 `www/` 的 SHA-256。完整快取可用 `scripts/build-android.ps1 -Offline`。

工具預設在專案內 `.tools/`；可透過 `ARCHCASE_TOOLS_ROOT` 指定其他本機資料夾。工具快取、`node_modules/`、記錄檔、`local.properties`、建置產物與偵錯簽章均被忽略，不應提交到公開儲存庫。自己的發布簽章也請單獨保管。

## 編輯入口

| 路徑 | 用途 |
| --- | --- |
| `source/archcase-orange-glass.html` | 可編輯的地圖 HTML 與案例索引 |
| `web/native.css`、`web/native.js` | 安全區域、系統列、鍵盤視埠與返回鍵調整 |
| `web/public/` | 隨應用程式散布的執行所需函式庫、世界底圖和授權文件 |
| `www/` | 可獨立檢視的網頁建置結果 |
| `android/` | 原生專案、Gradle Wrapper 與已同步的網頁資源 |
| `scripts/` | 整合、環境設定、建置與瀏覽器檢查 |
| `apk/` | 目前可下載 APK 與驗證檔案 |

`web/index.html` 與 `www/` 是產生檔案，請修改 `source/`。網頁版與本專案有相同的地圖原始碼副本，更新索引時請同步它們。預覽網頁：`npm run build` 後執行 `npm run preview`。

## 驗證與限制

公開版本在 2026-10-13 從整理後的原始碼重新編譯。Gradle `assembleDebug` 成功，APK v2 簽章驗證通過，全部打包網頁資源逐一比對雜湊值，確認與建置結果相同。已在 Chromium 檢查 390×844、360×640、844×390、1280×800；阻止全部外部請求時，世界概覽、221 個案例與互動仍可用，無 JavaScript 錯誤或水平溢出。

尚未在 Android 實機或 Android 模擬器安裝執行。瀏覽器檢查不能驗證實際裝置的狀態列、系統鍵盤、返回手勢或外部瀏覽器喚起效果。

## 授權文件

地圖執行所需函式庫授權隨 `web/public/vendor/` 保留。Capacitor Core、App、Android 的 MIT 授權在 `web/public/licenses/`，與應用程式一同打包；其他原生組件保留上游適用的聲明。案例文件與第三方資料的授權範圍見儲存庫根目錄。

## iOS 原始碼重用

專案已列出同版本 `@capacitor/ios` 相依套件，但未產生或發布 iOS 應用程式。在具有相容 Xcode 的 Mac 上可執行 `npm run ios:add`、`npm run sync:ios`、`npm run ios:open`，然後自行設定簽章和編譯。已有 `ios/` 時跳過 `ios:add`。
