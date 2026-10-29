---
title: 标准对象列表 store
keywords: [useStdListStore, StdListStoreOptions, 对象列表, 查询, 选择, 冲突]
status: done
---

# 标准对象列表 store

## 职责

`useStdListStore` 为 Walnut 对象列表提供完整数据模型：主目录、查询、分页、选择、本地编辑、内容、保存、冲突处理和界面动作状态。

```ts
const store = useStdListStore({
  homePath: "~/documents",
  autoCreateHome: true,
  query: {
    filter: { race: "FILE" },
    sorter: { nm: 1 },
    pager: { pageNumber: 1, pageSize: 50 },
  },
});

await store.init();
```

每次调用都通过 `defineStdListStore` 创建新模型，没有启用源码中已注释的全局单例缓存。

## 配置

### 数据位置

- **`homePath`（必填）**：主目录路径、`WnObj` 或返回二者的函数。
- **`indexPath`**：索引对象存储位置，缺省与 `homePath` 相同。
- **`dataPath`**：专用数据附件目录。
- **`autoCreateHome`**：主目录不存在时自动创建。

### 查询与选择

- **`query`**：默认 `SqlQuery` 或其工厂；基础分页默认第一页、每页 50 条。
- **`fixedMatch`**：固定过滤条件或其工厂。
- **`filterReady`**：TiJS Match，判断整个查询是否可执行。
- **`patchQuery`**：发送前修改查询。
- **`keepQuery` / `keepSelect`**：本地保存查询与选择的 TiJS `KeepInfo`。

### 编辑与加载

- **`refreshWhenSave`**：保存后自动刷新。
- **`patchRemote`**：远端记录进入模型前补充或修改。
- **`autoLoadContent`（默认 `false`）**：选中文件时自动加载内容。
- **`globalStatus`**：可选应用级状态接口。
- 其余本地编辑配置继承 `LocalListEditSetup`。

## 状态与动作

### 主要状态

- **数据**：`listData`、`remoteList`、`CurrentItem`、`CurrentContent`。
- **查询**：`Pager`、`Filter`、`Sorter`。
- **选择**：`CurrentObjId`、`hasCurrent`、`hasChecked`。
- **过程**：`ActionStatus`、`LoadStatus`、`ActionBarVars`、`changed` 与空态计算属性。

### 查询与目录

- **`init` / `reload` / `refresh` / `queryRemoteList`**：初始化、重载、刷新和远程查询。
- **`openDir`**：切换目录上下文。
- **`applyFilter` / `applySorter` / `applyPager`**：应用查询条件。

### 编辑与保存

- **`updateCurrent` / `updateItem(s)` / `remove*` / `append* / prepend*`**：维护本地列表。
- **`saveMeta`**：保存元数据修改。
- **`setCurrentContent` / `saveCurrentContent` / `saveChange`**：编辑和保存当前内容。
- **`makeDifferents` / `makeConflict` / `applyConflicts`**：生成差异、检测并应用冲突。
- **`dropChange`**：放弃本地改动。

### 选择

- **`onSelect` / `selectItem` / `updateSelection` / `cancelSelection`**：与 TiJS 列表或表格选择交互。

## 数据流

```text
init / queryRemoteList
  → useWnObj 查询 remote
  → patchRemote
  → listData = localList ?? remoteList
  → 用户编辑 localList / content
  → changed
  → saveMeta / saveChange
  → 更新 remote，必要时 refresh
```

## 注意事项

- `keepQuery` 只保存部分查询字段；`keepSelect` 保存当前与勾选 ID，不等于缓存远端数据。
- 元数据和内容共同决定 `changed`。
- 工厂配置会经 `Util.jsonClone` 复制；函数等不可 JSON 化的配置仍由原始 `options` 在部分逻辑中读取，扩展配置时应核对具体消费路径。
- 当前源码没有为此 store 做跨调用的单例复用，需要共享时应由上层保存同一个 API 实例。

## 延伸阅读

- **源码入口**
  - `src/lib/_store/std/use-std-list.store.ts` —— 完整实现与返回 API。
  - `src/lib/_store/std/support/auto-create-home.ts` —— 自动建目录。
  - `src/lib/_store/edit/use-local-list-edit.ts` —— 本地列表编辑。
  - `src/lib/_store/use-obj-content.store.ts` —— 当前内容状态。
- **相关文档**
  - [useWnObj](../40.features/use-wn-obj.md) —— 远程对象动作。
  - [本地编辑与内容](local-edit.md) —— 差异和草稿机制。
