---
title: 本地编辑与内容 stores
keywords: [useLocalListEdit, useLocalMetaEdit, useObjContentStore, 本地草稿, diff]
status: done
---

# 本地编辑与内容 stores

## 职责

这一组 composable 不直接决定业务数据来自对象还是 SQLX，而是维护远端快照与本地草稿，并把差异转换为可保存的数据。

## `useLocalListEdit`

输入远端列表 `Ref` 和 `LocalListEditSetup`，返回本地列表、变更状态、记录增删改、查找、差异与 SQLX 变更生成等能力。

- 第一次本地修改时，可从远端列表深拷贝生成 `localList`。
- `localList` 未建立表示没有本地列表修改；`makeChanges` 此时返回空变更。
- 更新按行 ID 匹配远端记录，新 ID 进入插入分支。
- 配置 `deleteSql` 时，远端有而本地没有的记录会生成删除动作，且删除放在更新前。
- `makeChanges` 同时返回 `changes` 与 `errors`，调用方不能只检查变更数组。

## `useLocalMetaEdit`

维护单条 `remoteMeta/localMeta`：

- **`updateMeta` / `setMeta`**：更新本地或设置记录。
- **`isChanged` / `getDiffMeta`**：判断并读取差异。
- **`makeChange` / `joinChange`**：按插入或更新配置生成 SQLX 动作。
- **`reset`**：重置本地状态。

远端记录不存在时走插入分支；存在时走更新分支。SQL、变量和回查配置可由对应选项提供。

## `useObjContentStore`

面向单个文件文本内容：

- `_remote` 是服务端文本快照，`_local` 是本地草稿。
- `changed` 在本地草稿非空值且与远端不同时为真。
- `Finger` 保存 `id/len/sha1/mime/tp`，加载和保存都以其 `id` 定位。
- `getChange` 使用 `diffLines` 返回行差异。
- `saveChange` 成功后更新远端文本及 `len/sha1`，清理本地草稿。
- `refreshContent(resetLocal = true)` 默认丢弃本地草稿；传 `false` 可保留。

## 注意事项

- 本地草稿不是远端缓存副本的永久替代；刷新、重载和放弃修改各有明确语义。
- 内容 `null` 在读取时可归一为空字符串，但本地 `undefined` 表示没有草稿。
- 生成 SQLX 动作不等于已经保存，仍需交给 `useSqlx.exec` 或 RDS store 执行。

## 延伸阅读

- **源码入口**
  - `src/lib/_store/edit/use-local-list-edit.ts` —— 列表草稿和变更生成。
  - `src/lib/_store/edit/use-local-meta-edit.ts` —— 单记录草稿。
  - `src/lib/_store/edit/use-make-meta-change.ts` —— 插入/更新变更构造。
  - `src/lib/_store/use-obj-content.store.ts` —— 文本内容状态。
- **相关文档**
  - [数据 store 模型](../10.concepts/05-data-stores.md) —— 三方差异与冲突。
  - [RDS stores](rds.md) —— SQLX 变更的执行入口。
