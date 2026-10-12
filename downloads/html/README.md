# 单文件 HTML 下载

简体中文 · [繁體中文](README.zh-TW.md) · [English](README.en.md)

点击下方链接会直接下载 `.html` 文件。下载完成后，从浏览器下载列表或文件管理器中打开；无需复制源码或更改扩展名。

| 文件 | 使用方式 |
| --- | --- |
| [下载 archcase.html](https://github.com/guopuxin09-afk/ArchCase/releases/download/html-2026-10-13/archcase.html) | 双击打开；地图运行库与世界概览数据从 jsDelivr 加载，失败时尝试 unpkg，需要联网。 |
| [下载 archcase-offline.html](https://github.com/guopuxin09-afk/ArchCase/releases/download/html-2026-10-13/archcase-offline.html) | 双击打开；运行库、世界概览与 221 个案例索引均内嵌，可离线使用。 |

两版使用同一套案例数据与界面。案例主链接指向仓库内 MD 学习文件；可选原 Notion 来源可能需要权限。

案例库内容以 [MD 文件](../../notes/README.md)提供；交互 HTML 是浏览这些内容的入口之一。MD 文件可直接阅读或导入 Notion、Obsidian 等工具。

离线版支持搜索、分类、地图标记、世界概览、主题与语言切换。街道地图、GitHub 案例全文、原 Notion 来源和周边地图仍需要联网。部分标记代表城市中心，请根据原始资料确认建筑准确位置。

手机浏览器直接打开本地 HTML 的能力因系统而异；手机使用可安装的 [`网页版`](../../web/) 或 [`Android APK`](../../android/) 更方便。

离线文件由 `web/scripts/build-standalone.cjs` 生成，包含第三方许可声明。修改地图源码后，进入 `web/` 执行 `npm run build:standalone` 重新生成。公开新版时，将两份 HTML 上传为新 Release 的附件，并同步更新三语下载链接。
