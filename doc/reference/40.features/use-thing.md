---
title: useThing 数据集访问
keywords: [useThing, Thing, get, create, update, 数据集]
status: done
---

# `useThing` 数据集访问

## 解决什么问题

`useThing` 是既有 Thing 数据集命令的轻量封装，提供读取、创建和更新三个动作。新代码选择它之前，应同时评估更通用的 `useWnObj` 或标准对象 store 是否更符合业务模型。

## 输入与返回值

```ts
const things = useThing("thing-set-id-or-path");
```

- **`get(id)`**：读取一条记录，空结果转换为 `undefined`。
- **`create(meta)`**：剔除 `pid` 与内置字段后创建记录。
- **`update(meta)`**：要求 `meta.id`，剔除内置字段后更新；只有返回文本是完整 JSON 对象时才解析返回。

```ts
const one = await things.get("record-id");
const updated = await things.update({ id: "record-id", title: "新标题" });
```

## 注意事项

- 构造参数和记录 ID 会移除单引号。
- `update` 缺少 ID 会抛错。
- 这里不维护查询、选择、加载或本地草稿状态。

## 延伸阅读

- **源码入口**
  - `src/lib/_features/use-thing.ts` —— 三个动作与命令构造。
- **相关文档**
  - [useWnObj](use-wn-obj.md) —— 通用对象数据访问。
  - [标准对象列表 store](../50.stores/std-list.md) —— 完整列表状态模型。
