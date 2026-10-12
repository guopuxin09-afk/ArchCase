# ArchCase Android

简体中文 · [繁體中文](README.zh-TW.md) · [English](README.en.md)

将建筑案例地图封装为 Capacitor Android 应用。保留 221 个案例、12 个分类、搜索筛选、地图聚合、中英切换与深浅主题。案例主链接指向本仓库的 MD 学习文件；可选原 Notion 来源可能需要权限。

MD 学习文件是案例库的内容，APK 是浏览地图与索引的一种形式。文件集中在 [`notes/`](../notes/README.md)，可下载后导入 Notion、Obsidian 等工具；APK 不会把外部全文与图片自动下载到手机。

## 安装包

- [下载 archcase-debug.apk](https://github.com/guopuxin09-afk/ArchCase/raw/refs/heads/main/android/apk/archcase-debug.apk)：版本 `1.0.1`，versionCode `2`，包名 `com.archcase.atlas`。
- [`apk/archcase-debug.apk.sha256`](apk/archcase-debug.apk.sha256)：文件 SHA-256，可用于校验下载完整性。
- 最低 Android 7.0（API 24）；目标 Android 16（API 36）。

1. 用 Android 手机浏览器点击上方 **下载 archcase-debug.apk**，等待下载完成。
2. 从浏览器的下载列表或手机文件管理器打开 `archcase-debug.apk`。
3. 如果系统提示不允许此来源安装应用，按提示进入设置，允许当前浏览器或文件管理器安装应用，然后返回安装页面。不同手机的选项名称可能不同。
4. 点击 **安装**，完成后点击 **打开**，或在应用列表中打开 **ArchCase**。

这是签名通过验证的 Debug 测试安装包，尚未作为正式签名的应用商店版本发行。若手机已有使用不同调试签名的旧版，系统可能要求先卸载旧版再安装；卸载会清除旧版的本地应用数据。安装完成后，可以在系统设置中关闭该来源的安装权限。

## 离线与联网

APK 内置地图界面、全部案例索引、地图运行库和 Natural Earth 世界概览，首次启动无需下载这些资源。断网可用搜索、分类、标记与聚合、世界概览、详情索引、主题和语言切换。在线街道瓦片、GitHub 案例全文、原 Notion 来源与周边地图需要联网。

它不包含离线街道或建筑轮廓。部分案例坐标代表城市中心；索引只是查找入口，年代、建筑师、分类和地点请继续与原始资料核对。

## 构建

要求 Node.js ≥ 22.12、JDK 21、Android SDK API 36 与 Build Tools 36.0.0。npm 依赖固定在 `package-lock.json`。Android Studio 用户可使用已配置的 `JAVA_HOME`、`ANDROID_HOME`：

```sh
cd android
npm ci
npm run sync:android
cd android
./gradlew assembleDebug
```

Windows 完整配置与校验脚本：

```powershell
npm.cmd run setup:android
npm.cmd run doctor
npm.cmd run apk:debug
```

`setup:android` 会联网下载 JDK/SDK、校验官方归档哈希并安装依赖。`apk:debug` 会生成网页、检查本地静态资源、同步 Capacitor、编译 APK、验证签名，并逐个比较 APK 内资源与 `www/` 的 SHA-256。完整缓存可用 `scripts/build-android.ps1 -Offline`。

工具默认在项目内 `.tools/`；可通过 `ARCHCASE_TOOLS_ROOT` 指定其他本地目录。工具缓存、`node_modules/`、日志、`local.properties`、构建产物与调试签名均被忽略，不应提交到公开仓库。自己的发布签名也请单独保管。

## 编辑入口

| 路径 | 用途 |
| --- | --- |
| `source/archcase-orange-glass.html` | 可编辑的地图 HTML 与案例索引 |
| `web/native.css`、`web/native.js` | 安全区域、系统栏、键盘视口与返回键适配 |
| `web/public/` | 随应用分发的运行库、世界底图和许可证 |
| `www/` | 可独立查看的网页构建结果 |
| `android/` | 原生工程、Gradle Wrapper 与已同步的网页资源 |
| `scripts/` | 集成、环境配置、构建与浏览器检查 |
| `apk/` | 当前可下载 APK 与校验文件 |

`web/index.html` 与 `www/` 是生成文件，请修改 `source/`。网页版与本工程有相同的地图源码副本，更新索引时请同步它们。预览网页：`npm run build` 后运行 `npm run preview`。

## 验证与限制

公开版本在 2026-10-13 从整理后的源码重新编译。Gradle `assembleDebug` 成功，APK v2 签名验证通过，全部打包网页资源逐个哈希与构建结果相同。已在 Chromium 检查 390×844、360×640、844×390、1280×800；阻止全部外部请求时，世界概览、221 个案例与交互仍可用，无 JavaScript 错误或横向溢出。

尚未在 Android 真机或 Android 模拟器安装运行。浏览器检查不能验证实际设备的状态栏、系统键盘、返回手势或外部浏览器唤起效果。

## 许可证

地图运行库许可随 `web/public/vendor/` 保留。Capacitor Core、App、Android 的 MIT 许可在 `web/public/licenses/`，与应用一同打包；其他原生组件保留上游适用的声明。案例文件与第三方资料的授权范围见仓库根目录。

## iOS 源码复用

工程已列出同版本 `@capacitor/ios` 依赖，但未生成或发布 iOS 应用。在具有兼容 Xcode 的 Mac 上可执行 `npm run ios:add`、`npm run sync:ios`、`npm run ios:open`，然后自行配置签名和编译。已有 `ios/` 时跳过 `ios:add`。
