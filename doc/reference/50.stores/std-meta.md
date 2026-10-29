---
title: 标准对象 Meta store
keywords: [useStdMetaStore, StdMetaStoreOptions, 单对象, 元数据, 内容]
status: done
---

# 标准对象 Meta store

## 职责

`useStdMetaStore` 管理单个 Walnut 对象的远端元数据、本地元数据草稿和文件内容。适合对象详情编辑器，而不是集合列表。

## 配置

- **`objPath`（`string | WnObj`，必填）**：目标对象路径或对象。
- **`refreshWhenSave`**：保存后自动刷新。
- **`patchRemote`**：读取远端对象后补充或修改数据。
- **`autoLoadContent`（默认 `false`）**：是否自动加载内容。
- 本地字段行为继承 `LocalMetaEditSetup`。

```ts
const store = useStdMetaStore({ objPath: "~/notes/readme.md" });
await store.init();

store.updateMeta({ title: "新标题" });
await store.saveMeta();
```

## 状态与动作

- **状态**：`MetaData`、`MetaId`、`CurrentContent`、`changed`、`ActionStatus`、`ActionBarVars`、`LoadStatus`。
- **本地编辑**：`updateMeta`、`setRemoteMeta`、`resetLocalChange`、`dropChange`。
- **内容**：`loadCurrentContent`、`setCurrentContent`、`saveCurrentContent`。
- **保存**：`saveMeta` 只提交 `getDiffMeta` 得到的非空增量，并附带当前对象 ID。
- **冲突**：`makeConflict`、`createConflictBy`、`applyConflicts`。
- **生命周期**：`init`、`reload`、`refresh`。

## 数据流

`MetaData` 优先返回本地草稿，其次远端对象，最后空对象。`changed` 同时考虑元数据草稿与内容草稿。保存元数据和保存内容是两个独立动作。

## 注意事项

- 未加载内容指纹时不能直接保存内容；通常先通过 `loadCurrentContent` 建立目标。
- `reload` 会重置本地修改后刷新，调用前应确认是否需要保留草稿。
- 每次调用工厂创建独立模型。

## 延伸阅读

- **源码入口**
  - `src/lib/_store/std/use-std-meta.store.ts` —— 单对象模型。
  - `src/lib/_store/edit/use-local-meta-edit.ts` —— 元数据草稿与差异。
  - `src/lib/_store/use-obj-content.store.ts` —— 内容草稿与保存。
- **相关文档**
  - [WnObjViewer](../30.components/view/obj/wn-obj-viewer.md) —— 可组合的详情视图。
  - [标准对象列表](std-list.md) —— 多对象场景。
