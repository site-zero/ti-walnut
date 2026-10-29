---
title: WnObjBrowser 对象浏览器
keywords: [WnObjBrowser, 对象浏览器, objList, homePath, worker, puppet]
status: done
---

# `WnObjBrowser` 对象浏览器

## 介绍

`WnObjBrowser` 是视图类（`VIEW`）对象浏览器，通过 TiJS 栅格布局组合对象路径、列表/墙贴、顶部操作区和详情区。它支持自行加载（`worker`）与外部数据驱动（`puppet`）两种模式。

源码目录：`src/lib/view/obj/obj-browser/`。

## 例子

### JSON 配置

```json
{
  "loadMode": "worker",
  "homePath": "~"
}
```

### Vue 标签调用

```xml
<WnObjBrowser load-mode="worker" home-path="~" />
```

外部已有对象列表时：

```xml
<WnObjBrowser
  load-mode="puppet"
  :obj-list="objects"
  :obj-path="ancestors"
  :current-dir-id="currentDirId"
/>
```

## 控件参数

### 数据

- **`homePath`（`string`，可选）**：主目录路径；`worker` 模式据此查询子对象和祖先路径，也用于生成上传目标。
- **`objList`（`WnObj[]`，可选）**：`puppet` 模式显示的对象列表。
- **`objPath`（`WnObj[]`，可选）**：`puppet` 模式显示的面包屑路径。
- **`currentDirId`（`string`，可选）**：`puppet` 模式当前目录高亮 ID。

### 行为

- **`loadMode`（`"puppet" | "worker" | "auto"`，默认按 `homePath` 判断）**：显式指定加载模式；未指定或 `auto` 时，有 `homePath` 用 `worker`，否则用 `puppet`。
- **`keepAt`（`KeepInfo`，可选）**：本地保存 `galleryMode` 与 `showDetail` 的设置位置。

### 外观

- **`galleryMode`（`GalleryMode`，类型可选）**：对象展示模式配置。当前实现的本地设置恢复路径以保存值或 `"wall"` 为准，未直接读取该 Prop；依赖它设置初始值前应先核对后续实现。

### 回调

本组件无函数类型回调 Props。

### 嵌套

本组件未提供直接内容插槽；内部区块由 `gui-wn-obj-browser-layout.ts` 与 `gui-wn-obj-browser-schema.ts` 组合。

### 事件

- **`change`（`any`）**：Emitter 类型中已声明，但当前 `useWnObjBrowserApi` 没有实际调用该 emit。现有版本不应依赖它接收选择或加载变化。

继承的 `CommonProps` 字段见 TiJS 共享 Props 文档。

## 数据加载边界

`worker` 模式每次重新加载会并行执行：

1. 按 `homePath` 查询子对象，排序为 `nm: 1`，第一页大小 `100`；
2. 加载从 `~` 到当前目录的祖先路径，并包含当前目录。

`puppet` 模式只同步 Props，不主动请求服务。

## 总结

需要开箱即用的目录浏览时选择 `worker`；需要由标准列表 store、路由或外部查询完全控制数据时选择 `puppet`。当前版本的选择与变更集成应通过内部 schema/上层组合进一步核对，而不是依赖未实际触发的 `change`。

## 延伸阅读

- **源码入口**
  - `src/lib/view/obj/obj-browser/wn-obj-browser-index.ts` —— 组件注册。
  - `src/lib/view/obj/obj-browser/wn-obj-browser-types.ts` —— Props 与 Emitter。
  - `src/lib/view/obj/obj-browser/WnObjBrowser.vue` —— 布局与监听。
  - `src/lib/view/obj/obj-browser/use-wn-obj-browser-api.ts` —— 加载模式、选择和本地设置。
  - `src/lib/view/obj/obj-browser/gui-wn-obj-browser-schema.ts` —— 内部组件组合。
- **相关文档**
  - [useWnObj](../../../40.features/use-wn-obj.md) —— `worker` 模式背后的对象查询。
  - [WnObjViewer](wn-obj-viewer.md) —— 对象详情视图。
