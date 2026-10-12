# 单文件 HTML 下载

简体中文 · [繁體中文](README.zh-TW.md) · [English](README.en.md)

**iPhone / iPad 推荐：在 Safari 打开[公开网页版](https://archcase-iphone-atlas.cuddlyshell7.chatgpt.site)，通过“分享 → 添加到主屏幕”使用。**

| 文件 | 使用方式 |
| --- | --- |
| [下载 archcase.html](https://github.com/guopuxin09-afk/ArchCase/releases/download/html-2026-10-13-ios/archcase.html) | 地图程序、世界概览和 221 个案例均内置；启动后尝试加载在线街道。街道服务不可用时，仍可操作世界概览。 |
| [下载 archcase-offline.html](https://github.com/guopuxin09-afk/ArchCase/releases/download/html-2026-10-13-ios/archcase-offline.html) | 默认直接使用内置世界概览，无需等待联网。搜索、分类、标记、详情、语言和主题切换可离线使用；需要街道细节时点击“加载街道地图”。 |

链接会直接下载 HTML，无需复制源码或更改扩展名。电脑请用浏览器打开。

iPhone / iPad 的文件预览可能不运行 JavaScript。新版会显示无需脚本的静态世界地图、221 个案例索引和“打开网页版”入口；文件预览里的静态模式不支持搜索、筛选或地图拖动。支持脚本的本地 HTML 查看器可以运行交互版，但具体能力取决于该应用。

“世界概览可用，当前无法连接街道服务”表示基础地图正常，在线街道服务未能连接。世界概览只有国家轮廓，不包含离线街道。街道瓦片、GitHub 案例全文、原 Notion 笔记和周边地图需要联网。部分坐标为城市中心，请核对原始资料。

两版 HTML 的案例主链接打开本仓库的 Markdown 笔记。[公开网页版](https://archcase-iphone-atlas.cuddlyshell7.chatgpt.site)是作者另外发布的 PWA，其中原 Notion 笔记可能仍需相应访问权限。所有公开笔记也可从 [Markdown 文档](../../notes/README.md)直接阅读或下载。

两份文件由 web/scripts/build-standalone.cjs 生成，包含第三方许可声明。在 web/ 运行 npm run build:standalone 会同时更新它们。发布时附加两份文件，并同步更新三语下载链接。

检查范围：桌面 Chromium、390px 手机和 820px 平板宽度、禁用脚本预览、阻断外部网络后的世界地图与搜索。未代替 iPhone / iPad 真机测试。
