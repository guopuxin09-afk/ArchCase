# 权利、来源与授权范围

简体中文 · [繁體中文](rights-and-sources.zh-TW.md)

## 原创程序代码

仓库根目录的 MIT 许可适用于本项目原创的程序逻辑和相关开发说明，包括网页交互、PWA 构建与缓存代码、Android 封装代码以及由维护者编写或经 Codex 生成整理的构建工具。使用 MIT 代码时请保留许可和版权声明。

这里的“原创程序代码”不包括依赖目录中原作者发布的文件，也不将内嵌案例资料自动视为程序代码授权。由 AI 生成代码这一事实已在 README 中公开说明。

## 笔记与案例资料

`notes/` 和数据文件中的案例资料是个人学习笔记与来源索引，本次公开供阅读、学习与参考，**未为全部笔记和资料授予统一的 MIT 或 Creative Commons 许可**。维护者能够授权的原创内容与第三方资料需要分别判断。

建筑名称、事实资料、引用文本及解释的权利性质可能不同。若要再出版、批量再分发或商业使用，请自行核实所使用内容的权利与许可；引用时请回到原始来源，并注明具体作者与页面。本次公开不表示维护者拥有所有来源材料的版权。

本次两个原始笔记目录没有图片附件或图片嵌入。所有 221 篇案例笔记至少有一个外部来源链接，部分建筑师笔记仍缺少外部出处。来源说明不是完整的事实或授权审计。

## 附带的第三方软件与地图数据

| 依赖 / 数据 | 版本 | 许可 / 来源 |
| --- | --- | --- |
| Leaflet | 1.9.4 | BSD-2-Clause |
| Leaflet.markercluster | 1.5.3 | MIT |
| D3 Array | 3.2.4 | ISC |
| D3 Geo | 3.1.1 | ISC |
| TopoJSON Client | 3.1.0 | ISC |
| world-atlas | 2.0.2 | ISC；世界边界源自 Natural Earth |
| Capacitor | 8.5.3；App 插件 8.1.2 | MIT |
| Vite | 8.3.4 | MIT |

已识别并打包的第三方软件保留其许可文件，见 `web/dist/licenses/` 与 Android 静态资源中的许可文件。npm 依赖版本以各工程的 `package-lock.json` 为准；原生 Android 依赖由 Gradle 配置和实际解析结果决定。附带的许可与来源记录说明本次检查范围，不作全部传递依赖已经完成法律审计的保证。

Natural Earth 地图数据的使用条件见其[官方条款](https://www.naturalearthdata.com/about/terms-of-use/)。世界边界文件与在线街道瓦片是不同的数据来源。

在线街道底图使用 Esri World Topographic Map，部分情况下回退到 OpenStreetMap 标准瓦片。界面保留底图署名；程序不批量下载或预缓存这些街道瓦片。任何新的托管部署需要遵守相应服务的现行条件与 [OSM 瓦片政策](https://operations.osmfoundation.org/policies/tiles/)，使用量增长时应评估合适的服务方案。

## 权利问题

如需纠正来源、署名或处理具体权利问题，请在仓库 Issue 中注明相关文件、依据与请求。公开反馈请避免包含私人材料。更多使用边界见 [DISCLAIMER.md](../DISCLAIMER.md)。
