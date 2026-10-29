---
title: WnObjViewer 对象查看器
keywords: [WnObjViewer, 对象查看器, 元数据, 预览, 内容编辑, blocks]
status: done
---

# `WnObjViewer` 对象查看器

## 介绍

`WnObjViewer` 是视图类（`VIEW`）组合组件，把对象元数据表单、内容预览和内容编辑组织为标签布局。内置块为 `meta`、`preview`、`content`，也允许通过 `blocks` 增加或覆盖实现。

源码目录：`src/lib/view/obj/obj-viewer/`。

## 例子

### JSON 配置

```json
{
  "meta": {
    "id": "demo-id",
    "nm": "note.txt",
    "race": "FILE",
    "mime": "text/plain",
    "tp": "txt"
  },
  "content": "hello walnut"
}
```

### Vue 标签调用

```xml
<WnObjViewer
  :meta="obj"
  :content="content"
  @show-content="onShowContent"
  @meta-change="onMetaChange"
  @content-change="onContentChange"
/>
```

`show-content: true` 表示当前标签需要内容，上层可据此懒加载文件内容。

## 控件参数

### 数据

- **`meta`（`Vars`，可选）**：对象元数据；未提供时显示空态路障牌。
- **`content`（`string`，可选）**：文件文本内容；目录不会进入文本编辑。
- **`fields`（`FieldRefer[]`，可选）**：元数据表单字段。
- **`metaFormConf`（`Omit<FormProps, "fields">`，可选）**：元数据表单额外配置。

### 行为

- **`tabs`（`string[]`，默认 `["meta", "preview", "content"]`）**：标签顺序。
- **`contentTab`（`string | string[]`，默认 `"content"`）**：哪些标签需要内容；进入这些标签时发出 `show-content`。
- **`formatJsonIndent`（`number`，默认 `2`）**：非字符串内容变更转 JSON 时的缩进；`0` 表示不格式化。
- **`dynamicBlocks`（`string[]`，可选）**：需要用 `{ meta, content, ContentData }` 上下文解释的动态块。
- **`blockEventRouter`（`Record<string, WnObjViewerBlockRouter>`，可选）**：把块事件路由到标准事件、内容局部修改或自定义处理器。

### 外观

- **`panels`（`string[]`，可选）**：需要放入面板显示的块。
- **`panelProps`（`LayoutPanelProps`，可选）**：弹出面板配置。
- **`emptyRoadblock`（`RoadblockProps`，有内置默认）**：无对象时的空态配置。
- **`previewShowTopMenu`（`boolean`，默认 `true`）**：预览块是否显示顶部菜单。
- **标签外观**：继承 `TabsAspect`，组件默认 `tabsAlign: "left"`、`tabsAt: "bottom"`、`tabItemSpace: "m"`。

### 回调

- **`blockEventRouter` 的函数值**：接收 `{ event, meta, content, ContentData }` 与原始 emit，可完全接管块事件。
- **`upload`（`WnUploadFileOptions`，可选）**：上传文件配置，供相关块使用。

### 嵌套

- **`blocks`（`Record<string, BlockProps>`，可选）**：新增或覆盖内置块；不是 Vue 插槽，而是 TiJS 动态组件配置。

### 事件

- **`show-content`（`boolean`）**：标签切换或对应块事件要求显示/隐藏内容时触发。
- **`meta-change`（`Vars`）**：元数据块提交增量时触发。
- **`content-change`（`string`）**：文本编辑、JSON 内容或路由后的局部修改触发。

## 内容块行为

- 可编辑文本/JSON/JavaScript MIME 使用 `TiCodeEditor`。
- 目录或不可编辑文件显示不可编辑路障牌。
- 动态块读取 `ContentData` 时尝试用 JSON5 解析 `content`，解析失败得到 `null`。
- 局部修改支持 `setPath`，以及 `merge`、`assign` 或直接设置三种方式。

## 总结

`WnObjViewer` 适合对象详情页，而不是单纯文件预览。只需预览时用 `WnObjPreview`；需要统一组合元数据、内容懒加载和可扩展块事件时使用本组件。

## 延伸阅读

- **源码入口**
  - `src/lib/view/obj/obj-viewer/wn-obj-viewer-types.ts` —— Props、事件与路由类型。
  - `src/lib/view/obj/obj-viewer/WnObjViewer.vue` —— 默认值与标签布局。
  - `src/lib/view/obj/obj-viewer/use-obj-viewer-schema.ts` —— 内置块和动态块。
  - `src/lib/view/obj/obj-viewer/use-wn-obj-viewer.ts` —— 内容转换和事件路由。
- **相关文档**
  - [对象模型](../../../10.concepts/04-obj-model.md) —— 元数据与内容分离。
  - [WnObjBrowser](wn-obj-browser.md) —— 列表与详情组合入口。
