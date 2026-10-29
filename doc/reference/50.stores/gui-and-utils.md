---
title: GUI 与辅助 stores
keywords: [useSidebar, useGuiViewMeasure, useEntityIdStore, 侧边栏, ID缓存]
status: done
---

# GUI 与辅助 stores

## `useSidebar`

侧边栏状态 `_sidebar` 定义在模块作用域，多次调用共享数据。

- **`reload(options?)`**：通过 `Walnut.fetchSidebar` 重载；提供 `pageHref` 时可同步文档标题。
- **`sidebar`**：当前侧边栏项目的计算属性。
- **`keepAt`**：服务端返回的 `statusStoreKey`。
- **`getItemBy(match)`**：用 TiJS Match 递归查找项目并返回深拷贝。
- **`updateDocumentTitleByHref(href, suffix?)`**：用匹配项目标题和可选后缀更新 `document.title`。

## `useGuiViewMeasure`

共享当前布局模式，默认 `desktop`，支持 `GuiViewLayoutMode` 定义的 `desktop | pad | phone`。

```ts
const view = useGuiViewMeasure();
view.setViewMode("phone");
console.log(view.viewMode.value);
```

## `useEntityIdStore`

为新建实体预取并缓存 ID。每次工厂调用拥有独立缓存。

- **`mode`（默认 `snowQ::10`）**：服务端 ID 生成模式。
- **`batch`（默认 `100`）**：缓存耗尽时每批获取数量。
- **`nextId()`**：返回下一个缓存 ID；耗尽后执行 `val gen ... -json` 补充。

```ts
const ids = useEntityIdStore({ batch: 20 });
const id = await ids.nextId();
```

## 其他辅助模型

- `useObjMetaStore`：对象元数据相关的独立模型，源码位于 `src/lib/_store/use-obj-meta.store.ts`。
- `userObjEdit`：创建一组对象编辑 `ref` 状态；函数名保留源码中的 `user` 拼写。

## 延伸阅读

- **源码入口**
  - `src/lib/_store/use-sidebar.store.ts` —— 共享侧边栏。
  - `src/lib/_store/use-gui-view-measure.store.ts` —— 共享布局模式。
  - `src/lib/_store/use-entity-id.store.ts` —— 独立 ID 缓存。
  - `src/lib/_store/use-obj-meta.store.ts`、`src/lib/_store/edit/use-obj-edit.ts` —— 其他对象编辑状态。
- **相关文档**
  - [会话与认证](session-auth.md) —— 另一类模块级共享状态。
