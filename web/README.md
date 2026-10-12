# ArchCase 网页版

简体中文 · [繁體中文](README.zh-TW.md)

这是建筑案例库的交互浏览入口，提供可安装网页（PWA）与静态网站源码。内容以 MD 文件提供：[案例分类](../notes/00%20Cases/README.md)、[建筑师索引](../notes/01%20Architect/README.md)。MD 文件可直接在 GitHub 阅读，也可按[文件使用与导入说明](../notes/README.md)导入 Notion、Obsidian 或其他 Markdown 工具。

## 使用

使用静态服务器打开 `dist/`。PWA 安装与离线缓存需要 HTTPS 或 `localhost`。GitHub Pages 可以部署 `dist/`；所有应用资源使用相对地址，也可部署在 `/ArchCase/` 这样的子路径。

```sh
cd web
npm ci
npm run build
python -m http.server 8080 --directory dist
```

打开 `http://localhost:8080/`。构建仅需要 Node.js ≥ 22.12，不需要原作者的本机目录、账号或专用托管服务。锁定版本的第三方运行库、世界概览数据与图标已放在 `assets/`，构建不会下载它们。

iPhone：用 Safari 打开 HTTPS 网页，点击“分享”→“添加到主屏幕”。支持安装提示的其他浏览器可使用页面上的“安装”按钮。浏览器可能清理离线缓存；页面安装说明会显示缓存是否准备完成。

## 离线与联网范围

首次成功打开网页并完成缓存后，可离线搜索案例、使用分类、查看标记与世界概览地图。街道瓦片、GitHub 案例全文、可选的原 Notion 笔记和周边地图需要联网。PWA 不缓存外部街道瓦片和笔记。

地图保留 221 个案例和 12 个分类；其中酒店分类目前为空。坐标沿用案例索引快照，部分代表城市中心，不能当作建筑入口的精确定位。建筑师、年代与分类也欢迎依据原始资料补充校正。

## 文件与编辑入口

| 文件夹 | 用途 |
| --- | --- |
| `source/archcase-orange-glass.html` | 地图界面、交互与内嵌案例索引的可编辑源码 |
| `scripts/` | PWA 构建、安装界面和离线缓存逻辑 |
| `assets/` | 锁定版本的第三方资源、许可证与预生成图标 |
| `dist/` | 可直接托管的静态网页，已随仓库提交 |
| `screenshots/` | 当前公开版本的桌面与手机浏览器截图 |

编辑源码后运行 `npm run build`。案例主链接指向本仓库对应的 MD 文件，原 Notion 地址只作为可选来源保留，可能需要原工作区的访问权限。若更名仓库或移动笔记，须同步修改内嵌案例 URL 与 URL 验证规则。

单文件下载版在 [`../downloads/html/`](../downloads/html/)。重新生成内嵌资源的离线 HTML：

```sh
npm run build:standalone
```

Android 工程使用同一版地图源码的副本；更新数据时请同步两个 `source/` 文件，再分别构建。

## 第三方资源

Leaflet 1.9.4、Leaflet.markercluster 1.5.3、D3 Array 3.2.4、D3 Geo 3.1.1、TopoJSON Client 3.1.0、world-atlas 2.0.2 的原始许可文本保留在 `assets/licenses/` 与 `dist/licenses/`。世界概览源于 Natural Earth；在线地图保留各提供方署名。案例文件、外部图片和资料的授权说明见仓库根目录，第三方许可不随项目代码许可变更。

## 验证范围

公开版本已完成 Node 构建与脚本语法检查，桌面和手机 Chromium 浏览器检查、221 个案例主链接检查，以及在 `/ArchCase/` 子路径完成缓存后的实际断网重载。浏览器验证覆盖搜索、分类、主题、语言、详情和世界概览；它不能证明所有 Safari 版本与设备行为相同。
