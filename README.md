# ArchCase · 建筑案例积累库

[简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md)

本科初期积累的建筑案例库，收集经典与个人喜爱的作品，希望帮助刚进入大学的建筑学学生，以及对建筑感兴趣的爱好者，发现、阅读与整理案例。

**先选资料，再选使用方式**：案例、建筑师与 T100 是资料内容；MD 文档与交互地图是阅读入口，HTML、PWA 和 APK 是地图的不同使用形式。

![ArchCase 桌面地图预览](web/screenshots/desktop.png)

## 1. 资料内容与阅读入口

| 资料 | 内容 | 从这里开始 |
| --- | --- | --- |
| 建筑案例 | 221 个作品，按 12 类整理 | [按建筑类型浏览](notes/00%20Cases/README.md) |
| 建筑师与事务所 | 83 个条目，另附普利兹克索引 | [建筑师索引](notes/01%20Architect/README.md) |
| T100 个人精选 | 以 20 世纪重要作品为主，包含少量 21 世纪案例 | [T100 阅读索引](notes/T100.md) |
| 全部 MD 文档 | 305 篇原始笔记，可下载、阅读和继续整理 | [文档目录与导入说明](notes/README.md) |

**T100 是什么**？这是我个人整理的一组建筑精选，最初希望选出自己认为对 **20 世纪建筑重要的约一百个作品**，也纳入了少量 21 世纪案例。它是一条带有个人判断、会继续调整的阅读线索。本次快照有 **101 篇带 T100 标签的案例笔记**，标签名称沿用最初选集的概念。

分类包括文化、教育、体育、酒店、医疗、工业与基础设施、商业与办公、公共、宗教、居住、改造与景观。`04 酒店建筑` 目前是空的预留分类；作品也可能同时具备多种属性。统计以 **2026-10-13** 公开快照为准。

不知道从哪里开始时，可以先从 T100 挑几个感兴趣的作品，再沿建筑师、类型和原始来源继续阅读。做课程设计时，也可以从同类功能、相似场地或具体空间问题查找，而不必先记住所有名字。

## 2. 选择地图版本

**第一次使用，建议先下载离线 HTML，用电脑浏览器打开**。 想在 Android 上安装使用，可选择 APK；希望自行搭建网页或添加到手机主屏幕，可使用 PWA 文件。

| 版本 | 获取方式 | 适合的用法 |
| --- | --- | --- |
| 离线 HTML | [下载 archcase-offline.html](https://github.com/guopuxin09-afk/ArchCase/releases/download/html-2026-10-13-ios/archcase-offline.html) | 单个文件，下载后用浏览器打开；内置地图运行资源 |
| 联网 HTML | [下载 archcase.html](https://github.com/guopuxin09-afk/ArchCase/releases/download/html-2026-10-13-ios/archcase.html) | 运行库和世界概览均内置；优先尝试在线街道地图 |
| 网页 / PWA | [直接打开网页版](https://archcase-iphone-atlas.cuddlyshell7.chatgpt.site) · [部署说明](web/README.md) | iPhone / iPad 用 Safari 打开，再通过分享菜单添加到主屏幕 |
| Android APK | [下载 archcase-debug.apk](https://github.com/guopuxin09-afk/ArchCase/raw/refs/heads/main/android/apk/archcase-debug.apk) · [安装说明](android/README.md) | Android 7.0 及以上的体验版，当前为 Debug 构建 |

上方 HTML 链接会直接下载 Releases 中的文件。电脑用浏览器打开；iPhone / iPad 的“文件”预览可能不运行脚本，新版会显示静态地图和案例索引。完整交互请用 Safari 打开[公开网页版](https://archcase-iphone-atlas.cuddlyshell7.chatgpt.site)。两份 HTML 都内置地图程序和世界概览，不再依赖 CDN 启动；离线版默认使用世界概览，可按需点击“加载街道地图”。

离线 HTML、APK，以及首次成功缓存后的 PWA，可以离线使用**世界概览、案例索引、搜索和分类**。街道底图、GitHub 案例全文与外部来源仍需联网。若要离线阅读完整笔记，请同时下载 MD 文档。手机对本地 HTML 的支持可能不同；iPhone 可通过 HTTPS 网站使用 PWA。

## 3. 地图怎么用

1. **搜索作品**。输入建筑名、建筑师、地点、年份或标签，例如 `Barcelona`、`T100`。
2. **筛选分类**。勾选一种或多种建筑分类，列表与地图会同步过滤；点击“查看全部结果”，让当前结果进入视野。
3. **浏览地图**。拖动地图，用 `+` / `−` 缩放；点击带数字的圆点，展开该处聚集的案例。
4. **打开详情卡**。点击列表中的作品或单个地图标记，查看案例信息。点击列表作品时，地图会自动定位。
5. **继续阅读**。点击“阅读案例笔记 ↗”打开本仓库的 MD 全文；点击“查看周边地图 ↗”了解周边位置。

想恢复全部案例，请**清除搜索词，并全选分类**。右上角可以切换中文 / 英文及明暗主题。手机可拖动或点击底部索引把手展开列表，桌面可收起筛选栏。另有[手机界面预览](web/screenshots/mobile.png)。

地图中的主要详情链接已对应本仓库笔记，另保留可选的原始来源笔记入口。部分标记为城市或区域级近似位置，实地访问前请核实准确地址和开放情况。

## 4. 下载文档与导入笔记软件

仓库顶部 **Code → Download ZIP** 可下载全部文件。解压后，学习文档位于：

- `notes/00 Cases/`：建筑案例，按类型分目录。
- `notes/01 Architect/`：建筑师、事务所与普利兹克索引。
- `notes/T100.md`：T100 个人精选的阅读入口。

MD 文件可以直接阅读，也可以按工具的导入方式放入 **Notion、Obsidian 等笔记软件**。建议把案例与建筑师两个目录一起导入。不同工具对 YAML 属性、标签、别名和 `[[Wiki 链接]]` 的支持不同，可能需要调整格式或关联；详见[文档说明](notes/README.md)。

也有 [Notion 版本](https://app.notion.com/p/3f4bdfcd663381a3aa5ed0267d6d283a)，能否访问取决于对应页面的分享权限。GitHub 提供公开快照，两个版本可能有更新差异。

305 篇原始笔记保留现有名称、正文、标签和来源，内容有详有略。本次仅公开案例与建筑师两个原始目录，未包含其他理论、策略和哲学条目，也未导出 Notion 的额外图片。原文中指向其他目录的关联仍然保留；具体范围见[收录说明](docs/collection-scope.md)。README、HTML 下载说明和 Android 安装指南提供简体中文、繁體中文与英文；其余仓库说明提供简繁双语，原始学习笔记保持现有语言。

## 5. 仓库文件放在哪里

| 目录 | 用途 |
| --- | --- |
| [`notes/`](notes/README.md) | MD 学习文档、分类索引、建筑师索引与 T100 |
| [`downloads/html/`](downloads/html/README.md) | 可直接下载的联网 / 离线 HTML 地图 |
| [`web/`](web/README.md) | 网页 / PWA 源码、构建脚本与 `dist/` 静态网页文件 |
| [`android/`](android/README.md) | Android 工程、内置网页资源与 `apk/` 安装包 |
| [`data/`](data/collection.json) | 收录统计与原始文档校验清单 |
| [`docs/`](docs/code-guide.md) | 程序导读、收录范围、权利说明与检查记录 |

只想使用地图或阅读文档，可以直接使用上面的入口。准备修改程序时，先读[代码导读](docs/code-guide.md)，再进入网页或 Android 工程说明。新增 MD 文件不会自动进入地图；地图的内嵌索引需要同步更新和重新构建。

## 6. Codex 参与、授权与使用说明

我负责案例积累、项目需求、设计方向，以及使用过程中的反馈与取舍。**本项目的自编程序代码由 OpenAI Codex 生成并协助迭代**，包括地图交互、界面、PWA、Android 封装、构建脚本，以及本次公开版本的整理和检查。程序同时使用 Leaflet、Capacitor 等第三方开源依赖。

AI 生成的代码和文字可能有误；这里也不对笔记作“全部由 AI 生成”或“全部经过人工事实核验”的笼统保证。已完成的构建、内容校验、公开配置清理和浏览器检查，以及未覆盖的真实设备测试，均见[公开版本检查记录](docs/publication-checks.md)。

- **程序代码**：自编程序代码采用 [MIT](LICENSE) 许可，允许在遵守许可条件的前提下修改和复用。
- **资料版权**：案例笔记、数据与第三方素材不自动适用代码的 MIT 许可。注明来源不等于获得转载授权；进一步引用请回到原始来源。
- **学习参考**：个人积累可能不完整或有误，不构成专业设计、施工、法规或安全意见。
- **应用状态**：APK 是 Debug 体验构建；离线范围和设备兼容性有边界，构建或浏览器检查不代表所有真实设备均已验证。

完整说明：[免责声明](DISCLAIMER.md) · [权利与第三方来源](docs/rights-and-sources.md) · [收录范围](docs/collection-scope.md)。

欢迎通过 [Issues](https://github.com/guopuxin09-afk/ArchCase/issues) 反馈事实错误、失效链接、程序问题或推荐案例，尽量附上具体条目和可靠来源。参与方式见 [CONTRIBUTING.md](CONTRIBUTING.md)。这是个人维护的项目，更新与回复可能不定期。
