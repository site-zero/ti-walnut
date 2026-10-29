---
title: 组件总目录
keywords: [组件, components, WnObj, WnHub, 注册组件, 26]
status: done
---

# 组件总目录

本页是默认注册组件的唯一全量清单，共 **26 个**。分类按源码目录；`race` 以各组件 `TiComInfo` 为准，因此少数组件的目录与 `race` 不同。

`WnSky` 虽有自己的组件索引，但未加入 `src/lib/index.ts` 汇总注册的默认组件集，不计入本清单。

## edit · 编辑与配置

- [WnSetupTheme](edit/wn-setup-theme.md)（`EDIT`）：主题设置编辑器。
- [WnSliderEditor](edit/wn-slider-editor.md)（`TILE`）：幻灯片编辑器。

## input · 对象输入与上传

- [WnObjMultiUploadTiles](input/wn-obj-multi-upload-tiles.md)（`VIEW`）：多文件上传贴片组。
- [WnObjTitle](input/wn-obj-title.md)（`VIEW`）：对象图标、标题与快捷重命名。
- [WnObjUploadBar](input/wn-obj-upload-bar.md)（`INPUT`）：单对象上传条。
- [WnObjUploadTile](input/wn-obj-upload-tile.md)（`INPUT`）：单对象上传贴片。

## shelf · 容器

- [WnLazzyProxy](shelf/wn-lazzy-proxy.md)（`SHELF`）：按条件延迟加载内容的代理容器；注册名保留 `Lazzy` 拼写。

## tile · 小片

- [WnObjThumb](tile/wn-obj-thumb.md)（`TILE`）：对象缩略图、标题与标记卡片。

## view · 冲突与 Hub

- [WnConflictView](view/conflict/wn-conflict-view.md)：本地、远端与基线差异的冲突视图。
- [WnHubAvatar](view/hub/wn-hub-avatar.md)：Hub 用户头像与会话入口。
- [WnHubFoot](view/hub/wn-hub-foot.md)：Hub 底部状态与提示区。
- [WnHubSession](view/hub/wn-hub-session.md)：Hub 会话操作区。
- [WnHubSideNav](view/hub/wn-hub-side-nav.md)：Hub 侧边导航。
- [WnHubSky](view/hub/wn-hub-sky.md)：Hub 顶部区域。

## view · 对象

- [WnObjBrowser](view/obj/wn-obj-browser.md)：组合路径、对象列表与详情的浏览器。
- [WnObjBrowserSkyBar](view/obj/wn-obj-browser-sky-bar.md)：对象浏览器的顶部操作条。
- [WnObjGallery](view/obj/wn-obj-gallery.md)：对象列表的可切换展示形态。
- [WnObjList](view/obj/wn-obj-list.md)：Walnut 对象列表。
- [WnObjMeta](view/obj/wn-obj-meta.md)：对象元数据表单。
- [WnObjPreview](view/obj/wn-obj-preview.md)：按对象类型预览内容。
- [WnObjTable](view/obj/wn-obj-table.md)：Walnut 对象表格。
- [WnObjViewer](view/obj/wn-obj-viewer.md)：元数据、预览与内容编辑的组合视图。
- [WnObjWall](view/obj/wn-obj-wall.md)：对象墙贴布局。

## view · RDS 与其他

- [WnRdsBrowser](view/rds/wn-rds-browser.md)：RDS 数据浏览与编辑视图。
- [WnCmdRunner](view/misc/wn-cmd-runner.md)：Walnut 命令输入与执行视图。
- [WnSignin](view/misc/wn-signin.md)：登录表单；注册名为 `WnSignin`。

## 页面状态

详细用法优先从 `WnSignin`、`WnObjBrowser`、`WnObjViewer`、`WnObjTitle` 开始。其余登记页已给出注册名、职责与源码入口，在逐项核对 Props/Events 前保持 `draft`。

## 延伸阅读

- **源码入口**
  - `src/lib/index.ts` —— 默认组件注册入口。
  - `src/lib/view/index.ts`、`src/lib/input/index.ts` —— 组件清单核对依据。
- **相关文档**
  - [组件注册模型](../10.concepts/02-component-registration.md) —— 注册名与目录分类规则。
