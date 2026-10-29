---
title: 数据 store 模型
keywords: [store, 远端快照, 本地草稿, 查询, 选择, 冲突]
status: done
---

# 数据 store 模型

## 要解决的问题

列表页不只有一组远程记录：它还包括查询条件、分页、当前行、勾选项、本地修改、加载状态和保存冲突。把这些状态都塞进组件，会让视图难以复用，也无法统一处理远端变更。

## 解决思路

```text
远端快照 remote
  ├─ 查询与刷新更新
  ├─ 作为差异比较基线
  ▼
本地草稿 local
  ├─ 用户编辑，不立即覆盖 remote
  ├─ changed = local 与 remote 有差异
  └─ 保存成功后更新 remote 并清理草稿

查询 / 分页 / 选择 / 内容 / ActionStatus
  └─ 作为独立但协同的响应式状态
```

标准对象 store 使用 `useWnObj`，RDS store 使用 `useSqlx`；两者都复用本地列表或元数据编辑能力，因此上层组件可以用相似方式处理查询和保存。

## 关键细节

- store 是 composable，不要求安装 Pinia。
- `useSessionStore` 的状态在模块作用域，属于共享会话；列表和 meta store 的主要状态在工厂函数内，每次定义通常形成独立模型。
- `keepQuery` / `keepSelect` 通过 TiJS `useKeep` 持久化部分查询与选择状态，不代表持久化整个远端列表。
- 保存前可生成三方差异：原始 remote、本地 local、最新 server；冲突解决不是简单覆盖。
- 元数据与内容分别计算改动，`changed` 可以来自任一类。
- `GlobalStatusApi` 是可选的应用级状态接口，不是每个 store 都必须使用。

## 主要代码入口

- `useStdListStore` / `useRdsListStore`：列表查询、选择和编辑。
- `useStdMetaStore` / `useRdsMetaStore`：单记录元数据与内容。
- `useLocalListEdit` / `useLocalMetaEdit`：本地草稿和差异。
- `useObjContentStore`：文件内容编辑与保存。

## 延伸阅读

- **源码入口**
  - `src/lib/_store/std/use-std-list.store.ts` —— 标准对象列表。
  - `src/lib/_store/rds/use-rds-list.store.ts` —— RDS 列表。
  - `src/lib/_store/edit/` —— 本地编辑与差异逻辑。
- **相关文档**
  - [标准对象列表 store](../50.stores/std-list.md) —— 配置与数据流。
  - [RDS store](../50.stores/rds.md) —— SQLX 驱动的数据模型。
