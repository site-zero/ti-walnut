---
title: useWnObj 对象数据访问
keywords: [useWnObj, WnObj, CRUD, query, loadContent, writeText]
status: done
---

# `useWnObj` 对象数据访问

## 解决什么问题

`useWnObj` 把 Walnut 对象命令与内容端点封装成一组 TypeScript 异步函数。调用方不需要在每个组件里重复拼接 `o @fetch`、`o @query` 等命令。

```ts
const objs = useWnObj("~/documents");
```

`homePath` 默认是 `~`，用于相对路径解析、子对象查询和创建对象的默认父目录。每次调用都会创建一组闭包函数，不是共享数据 store。

## 输入

- **`homePath`（`string`，默认 `"~"`）**：对象操作基准路径；构造时移除单引号。

## 返回值 API

### 按路径或 ID 读取

- **`fetch(path)`**：按路径读取一个对象；不存在时返回 `undefined`。
- **`fetchBy(...paths)`**：批量按路径读取；空输入直接返回 `[]`。
- **`get(id, setup?)`**：按 ID 读取；`strict` 控制 `-ignore`，`loadPath` 追加 `@path`。
- **`getBy(...ids)`**：批量按 ID 读取；空输入直接返回 `[]`。
- **`getChild(filterOrName)`**：在 `homePath` 下按名称或过滤条件取第一个子对象，没有结果返回 `null`。
- **`getAncestors(options?, path?)`**：读取祖先路径，可设置截止路径/条件、是否包含自身和是否排除顶端。

### 创建、修改与删除

- **`create(meta)`**：在 `homePath` 或 `meta.pid` 指定父级下创建；`race` 默认 `FILE`。
- **`update(meta)`**：按 `meta.id` 更新业务元数据，移除内置字段后提交；缺少 ID 会抛错。
- **`removeById(...ids)` / `removeByPath(...paths)`**：批量删除并返回服务端对象列表。
- **`moveTo(obj, targetPath)`**：当前实现只处理 `FILE`，通过复制、缩略图调整和删除旧对象完成移动。
- **`rename(info, newName)`**：按 `id` 或 `ph` 重命名；信息不足时返回 `undefined`。

### 查询与内容

- **`query(parentPathOrDir, query, options?)`**：按过滤、排序和分页查询，返回 `[WnObj[], Pager]`。
- **`queryChildren(query, options?)`**：以 `homePath` 为父级查询。
- **`loadContent(path, { as })`**：读取文本，`as: "json"` 时用 JSON5 解析。
- **`writeText(path, content)`**：保存文本并返回更新后的对象。

## 典型用法

```ts
import { useWnObj } from "@site0/ti-walnut";

const objs = useWnObj("~/documents");

const [list, pager] = await objs.queryChildren({
  filter: { race: "FILE" },
  sorter: { nm: 1 },
  pager: { pageNumber: 1, pageSize: 50 },
});

if (list[0]) {
  const text = await objs.loadContent(`id:${list[0].id}`);
}
```

更新元数据时传入 ID 与增量字段：

```ts
await objs.update({ id: "object-id", title: "新标题" });
```

## 注意事项

- 查询默认添加 `-mine`；传 `options.mine: false` 才关闭。
- `query` 使用 `_q.pager` 决定是否请求分页信息，并通过 `getQueryLimit` 计算 `limit/skip`。
- `create` 与 `update` 会剔除内置字段，避免客户端覆盖服务维护的元数据。
- `moveTo` 对目录会弹出警告并返回，不是通用目录移动 API。
- 这里返回的是数据操作方法；查询状态、加载状态和本地草稿由 store 层维护。

## 延伸阅读

- **源码入口**
  - `src/lib/_features/use-wn-obj.ts` —— 本篇全部 API。
  - `src/core/wn-util.ts` —— 路径与命令参数处理。
  - `src/_types/wn-types.ts` —— 对象和查询选项。
- **相关文档**
  - [对象模型](../10.concepts/04-obj-model.md) —— 对象与内容的边界。
  - [标准对象列表 store](../50.stores/std-list.md) —— 在列表场景中使用这些动作。
