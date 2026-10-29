---
title: useSqlx SQLX 数据访问
keywords: [useSqlx, defineSqlx, SQLX, query, fetch, count, exec]
status: done
---

# `useSqlx` SQLX 数据访问

## 解决什么问题

`useSqlx` 把 Walnut `sqlx` 命令封装成查询、单条读取、计数和执行 API，并按 DAO 名称缓存 API 对象。RDS stores 与业务代码可以共享这一套命令构造和错误处理逻辑。

## 输入与缓存

```ts
const sqlx = useSqlx("main");
```

- **`daoName`（`string`，可选）**：DAO 名称；未提供时使用默认键 `__sqlx_default__`。
- `useSqlx` 使用模块级 `Map` 按 DAO 名称缓存 API。
- `defineSqlx(daoName?)` 每次直接创建新 API，不读取该缓存。

## 返回值 API

- **`query(sql, query)`**：接收 `SqlQuery`，组合 `filter/sorter/limit/skip/vars/columns` 后查询，返回数组。
- **`select(sql, q)`**：直接以 `Vars` 为上下文查询，返回数组。
- **`fetch(sql, filter)`**：期望单条结果；一条时返回该记录，多条会警告，空结果返回 `undefined`。
- **`count(sql, filter, countKey?)`**：从第一条结果读取统计字段，默认键 `total`；空数组返回 `0`。
- **`exec(infos, options?)`**：执行一个或一组 `SqlExecAction`，支持事务、管线上下文、版本检查、回查与结果解析。
- **`getSqlStr(sql, q)`**：SQL 为函数时先按上下文求值，否则直接返回。

## 典型用法

```ts
import { useSqlx } from "@site0/ti-walnut";

const sqlx = useSqlx();

const users = await sqlx.query("user.query", {
  filter: { blocked: false },
  sorter: { nm: 1 },
  pager: { pageNumber: 1, pageSize: 50 },
});

const total = await sqlx.count("user.count", { blocked: false });
```

SQL 也可以由函数根据查询上下文生成：

```ts
const rows = await sqlx.select(
  (q) => (q.detail ? "user.detail" : "user.summary"),
  { detail: true }
);
```

## 注意事项

- `query` 会把 `columns` 转为逗号分隔字符串，并把分页参数展开到命令上下文。
- `exec` 默认启用事务（`transLevel` 默认 `1`）；设为 `0` 可不追加 `@trans`。
- `exec` 服务端文本若以 `e.*` 错误格式返回，会转换为带 `name` 的 `Error` 再抛出。
- 查询错误会记录当前 SQL 与参数后继续抛出，调用方需要处理失败。
- `useSqlx` 缓存的是操作 API，不是查询结果；不要把它当作数据缓存 store。

## 延伸阅读

- **源码入口**
  - `src/lib/_features/use-sqlx.ts` —— 查询、执行和 DAO 缓存。
  - `src/_types/sql-types.ts` —— `SqlQuery`、`SqlExecAction` 与结果类型。
  - `src/core/wn-cmds.ts` —— 命令相关辅助出口。
- **相关文档**
  - [RDS store](../50.stores/rds.md) —— SQLX 如何驱动响应式列表。
  - [Walnut 服务单例](../20.core/10-walnut-server.md) —— 底层命令执行。
