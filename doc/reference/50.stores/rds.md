---
title: RDS stores
keywords: [useRdsListStore, useRdsMetaStore, useRdsSimpleStore, SQLX, RDS]
status: done
---

# RDS stores

## 职责

RDS stores 以 `useSqlx` 为数据访问层，为关系数据提供列表、单记录和简单数据模型。它们复用本地编辑与差异生成能力，接口风格与标准对象 stores 接近。

## `useRdsListStore`

关键配置：

- **`daoName`**：SQLX DAO 名称。
- **`query`（必填）**：默认查询或其工厂。
- **`sqlQuery`（必填）**：列表查询 SQL 模板名或函数。
- **`sqlCount`**：计数 SQL 模板名或函数。
- **`fixedMatch` / `defaultFilter` / `filterReady` / `patchQuery`**：查询组合与就绪判断。
- **`queryPrefix` / `countPrefix`**：按字段或函数为查询和计数添加字段前缀。
- **`makeChange`**：把本地列表差异转换为 SQLX 执行动作。
- **`newItem` / `newItemVars`**：新建记录模板和命令变量。
- **`keepQuery` / `keepSelect` / `refreshWhenSave` / `patchRemote`**：本地保持、刷新和远端记录加工。

主要状态与动作包括 `listData`、`CurrentItem`、`Pager/Filter/Sorter`、`changed`、`queryRemoteList`、`countRemote`、`createNewItem`、`makeChanges`、`saveChange`、`makeConflict`、`reload/refresh` 以及完整的选择和本地编辑方法。

```ts
const store = useRdsListStore({
  daoName: "main",
  query: {
    filter: {},
    sorter: { nm: 1 },
    pager: { pageNumber: 1, pageSize: 50 },
  },
  sqlQuery: "pet.query",
  sqlCount: "pet.count",
});

await store.reload();
```

SQL 模板名需要存在于应用的 Walnut SQLX 环境中，本库不内置这些业务模板。

## `useRdsMetaStore`

面向单条 RDS 记录，组合远端 meta、本地 meta 和 SQLX 变更生成。适用于详情编辑，与 `useStdMetaStore` 的对象内容能力不同。

## `useRdsSimpleStore`

提供较精简的 RDS 数据模型；`defineRdsSimpleStore` 是直接工厂，`useRdsSimpleStore` 是公开调用入口。选择它前应阅读源码确认当前返回字段是否满足场景，不要用完整列表 store 的 API 想象它。

## 注意事项

- 列表工厂每次创建独立模型，没有启用已注释的全局单例缓存。
- 删除变更可排在更新前，以降低主键冲突风险；具体由本地列表 `makeChanges` 生成。
- 版本检查、事务和回查最终由 `useSqlx.exec` 处理。
- `queryPrefix` 解决联合查询字段前缀问题，不会修改业务原始数据。

## 延伸阅读

- **源码入口**
  - `src/lib/_store/rds/use-rds-list.store.ts` —— 完整列表模型。
  - `src/lib/_store/rds/use-rds-meta.store.ts` —— 单记录模型。
  - `src/lib/_store/rds/use-rds-simple.store.ts` —— 精简模型。
  - `src/lib/_features/use-sqlx.ts` —— SQLX 数据访问。
- **相关文档**
  - [useSqlx](../40.features/use-sqlx.md) —— 查询与执行接口。
  - [本地编辑与内容](local-edit.md) —— SQL 变更的来源。
