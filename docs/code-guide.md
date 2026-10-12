# 代码导读与注释说明

[简体中文](code-guide.md) · [繁體中文](code-guide.zh-TW.md)

这份导读说明项目自行编写的代码、构建流程与已有注释的用意。代码由 OpenAI Codex 生成并协助迭代；阅读时仍以实际源码和测试结果为准。第三方代码与原始许可文字保持原样。

## 先找对编辑入口

| 文件 | 负责什么 | 更新时注意 |
| --- | --- | --- |
| [`web/source/archcase-orange-glass.html`](../web/source/archcase-orange-glass.html) | 地图界面、搜索分类、主题、语言、案例详情与内嵌索引 | 案例数据在 `archcase-data` JSON；更新 Markdown 不会自动更新此索引。 |
| [`web/scripts/build.cjs`](../web/scripts/build.cjs) | 将 HTML、安装界面、图标与本地运行资源组合成 PWA | 生成 `web/dist/`，不要直接在生成的网页里修改功能。 |
| [`web/scripts/build-standalone.cjs`](../web/scripts/build-standalone.cjs) | 把运行库、样式、世界概览与许可文字内嵌为离线单文件 HTML | 输出 `downloads/html/archcase-offline.html`；不包含离线街道或案例全文。 |
| [`web/scripts/pwa.js`](../web/scripts/pwa.js) | 安装说明、缓存状态、可用更新与视窗高度 | 要配合生成的 HTML 元素 ID；使用支持 HTTPS 或 `localhost` 的 Service Worker。 |
| [`web/scripts/sw-template.js`](../web/scripts/sw-template.js) | 应用自身的离线缓存 | 构建时填入资源清单与版本哈希；不缓存外部街道瓦片或笔记。 |
| [`android/source/archcase-orange-glass.html`](../android/source/archcase-orange-glass.html) | Android 使用的同版地图源码副本 | 更新地图时，请与网页版副本同步。 |
| [`android/scripts/integrate-archcase.mjs`](../android/scripts/integrate-archcase.mjs) | 改用本地运行库和世界底图，加入原生适配，复制许可声明 | 生成 `android/web/index.html`；Vite 再构建到 `android/www/`。 |
| [`android/web/native.css`](../android/web/native.css)、[`native.js`](../android/web/native.js) | 系统栏安全区域、键盘视窗、主题与 Android 返回键 | 修改后需要重新同步、编译 APK；浏览器检查不能取代真机验证。 |

## 构建注释在说什么

PWA 与 Android 构建脚本会寻找指定源码片段再替换。`replaceOnce` 检查预期位置仍然存在，避免 HTML 结构改变后套用了错误修改。如果改变资源加载函数、安装界面或重要标记，需要一起调整脚本中的对应片段。

构建脚本也会解析内嵌案例 JSON，检查打包前后数据没有意外变化，并用 Node `vm.Script` 检查普通内联 JavaScript 的语法。这些检查有助于发现生成过程的问题，不能证明案例事实或所有交互行为都正确。

地图中的拼音排序注释，说明中文拼音键和拉丁字母名称如何共同排序；主题颜色注释说明分类颜色采用 CSS 变量，让明暗切换能够调整对比。Android 样式注释说明地图和面板需要避开系统栏及屏幕缺口，并减少触摸拖动时意外选中文字。

## 离线缓存与版本

PWA 构建从输出资源内容计算版本哈希，填入 Service Worker 缓存名称。用户打开网站并完成缓存后，可以从同一份缓存取得应用界面、世界概览和案例索引。更新按钮启用新的 Worker 后会重新加载页面；旧版 ArchCase 缓存会在启用流程中清理。

外部街道地图、GitHub 笔记和 Notion 来源不在缓存范围内。浏览器也可能自行清理离线数据，因此“已安装”不代表内容永久保存。

## 案例链接与 URL 验证

每个案例的 `url` 是本仓库 Markdown 笔记的公开链接，`notePath` 记录相对路径，`notionUrl` 保留可选原 Notion 来源。案例名称应对应真实文件名；空格和中文等路径字符需要正确编码。

`publicNoteUrls` 从内嵌案例索引建立确切的允许列表。`safeUrl` 要求 HTTPS，排除账号密码和自定义端口；GitHub 案例链接还需符合允许列表，且不能携带查询参数或片段。可选 Notion 来源使用限定域名的 HTTPS 链接，能否打开仍取决于 Notion 权限。

换用自己的仓库时，请更新索引里的 `url`、`notePath` 和 `repository`，同步网页与 Android 副本，再检查实际详情链接。不要为了让失效链接通过而删除验证。

## Android 的安全区域与更新位置

`native.css` 通过 CSS 变量处理四边安全区域；`native.js` 会根据明暗主题调整系统栏显示、跟踪可见视窗高度，并在按返回键时优先关闭案例预览或详情，再处理输入焦点、历史记录或退出应用。实际键盘、手势、系统栏和外部链接打开效果需要 Android 设备确认。

| 想改什么 | 更新位置 |
| --- | --- |
| 案例名称、年代、分类、坐标和链接 | 两份 `source/archcase-orange-glass.html` 的 `archcase-data` |
| PWA 名称、图标和离线资源 | `web/scripts/build.cjs`、`web/assets/`；重新构建网页 |
| Android 名称和包标识 | `android/capacitor.config.json` 与原生工程对应设置；现有 Java 包和 namespace 也要一致 |
| APK 版本 | `android/android/app/build.gradle` 的 `versionCode`、`versionName`；另同步 npm 项目版本与下载说明 |
| 新的 APK 和校验信息 | `android/apk/`；重新编译、验证签名、资源一致性及 SHA-256 |

网站构建：在 `web/` 执行 `npm run build`；离线 HTML：`npm run build:standalone`。Android 环境与命令详见 [`android/README.md`](../android/README.md)。只读笔记或使用现成下载文件时，不需要编译。

## 修改后如何检查

先确认案例 JSON 能解析、名称与笔记文件一一对应，再进行构建和必要语法检查。实际打开页面检查搜索、筛选、语言、主题、详情和主链接；确认桌面、竖屏手机和横屏手机没有布局溢出。需要离线使用时，测试断网重载或内嵌资源版本，不要只根据“没有外部 script 标签”判断。

APK 应检查签名、版本信息及打包资源与网页构建结果是否一致，再补上设备验证。公开版本已完成的检查与限制见[检查记录](publication-checks.md)。
