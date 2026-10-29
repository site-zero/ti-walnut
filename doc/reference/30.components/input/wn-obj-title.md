---
title: WnObjTitle 对象标题
keywords: [WnObjTitle, 对象标题, 重命名, 双击编辑, prefixIcons]
status: done
---

# `WnObjTitle` 对象标题

## 介绍

`WnObjTitle` 用于显示对象图标、标题和悬浮元数据信息，并支持双击标题进行快捷编辑。组件位于 `src/lib/input/`，但注册的 `TiComRace` 是 `VIEW`。

## 例子

### JSON 配置

```json
{
  "meta": {
    "id": "demo-id",
    "nm": "readme.md",
    "race": "FILE",
    "mime": "text/markdown",
    "title": "项目说明"
  }
}
```

### Vue 标签调用

```xml
<WnObjTitle :meta="obj" @change="onTitleChange" />
```

也可以直接用 `value` 覆盖 `meta.title` 与 `meta.nm` 的显示文本。

## 控件参数

### 数据

- **`value`（`string`，可选）**：优先显示的标题文本。
- **`meta`（`WnObj`，可选）**：对象元数据，用于标题回退、对象图标和悬浮信息。

标题取值顺序为 `value → meta.title → meta.nm → 空字符串`。

### 行为

- **双击编辑**：双击标题调用 TiJS `Be.EditIt`；编辑结果非 `null/undefined` 时发出 `change`，空字符串转换为 `null`。
- **`actionBar`（`ActionBarProps`，可选）**：标题旁动作菜单；内置快捷命令 `EDIT` 对应编辑标题。

### 外观

- **`prefixIcons`（`IconProps[]`，可选）**：在对象图标前追加一组提示图标。
- 继承 `CommonProps`，通用类名和样式规则见 TiJS 文档。

### 回调

本组件没有独立函数类型 Props；动作行为由 `actionBar` 配置与组件内部编辑 API 组合。

### 嵌套

本组件未提供插槽，图标与文本由 Props 决定。

### 事件

- **`change`（`string | null`）**：快捷编辑提交新标题时触发；空标题载荷为 `null`。

## 总结

`WnObjTitle` 适合对象详情标题栏和列表卡片标题。它只发出标题变化，不会自行调用 `useWnObj.update` 保存；持久化由上层 store 或事件处理器完成。

## 延伸阅读

- **源码入口**
  - `src/lib/input/obj-title/wn-obj-title-index.ts` —— 注册信息。
  - `src/lib/input/obj-title/wn-obj-title-types.ts` —— Props 与 Emitter。
  - `src/lib/input/obj-title/WnObjTitle.vue` —— 图标、标题和双击接线。
  - `src/lib/input/obj-title/use-wn-obj-title-api.ts` —— 标题回退、提示和编辑行为。
- **相关文档**
  - [对象模型](../../10.concepts/04-obj-model.md) —— `title`、`nm` 与对象元数据。
  - [useWnObj](../../40.features/use-wn-obj.md) —— 持久化元数据修改。
