---
title: Walnut 字典适配
keywords: [installWalnutDicts, WnDictSetup, 字典, 动态字典, 命令]
status: done
---

# Walnut 字典适配

## 职责

`installWalnutDicts` 把 Walnut 的对象、命令和静态 JSON 资源转换为 TiJS 字典。它只负责数据获取适配；字典注册、缓存和选项消费模型仍由 TiJS 提供。

```text
WnDictSetup.data / query / item
  → 静态数组、load:// JSON 或 Walnut 命令
  → TiJS DictSetup
  → 静态字典或动态字典工厂
```

## 配置能力

- **`data`**：静态数组、`load://` 资源路径或命令文本，用于加载字典数据。
- **`query`**：命令模板，用于按输入查询候选项。
- **`item`**：命令模板，用于按输入加载单个项目。
- **`input`**：命令执行的标准输入；动态字典可先从上下文解释。
- **`value` / `text` / `tip`**：字典字段抽取规则。
- **`icon`**：字段路径或 TiJS `SelectValueArm` 配置。
- **`dynamic`**：为 `true` 时创建动态字典工厂，命令模板按上下文变量渲染。

## 典型用法

```ts
import { installWalnutDicts } from "@site0/ti-walnut";

installWalnutDicts({
  fileTypes: {
    data: [
      { value: "txt", text: "纯文本" },
      { value: "json", text: "JSON" },
    ],
    value: "value",
    text: "text",
  },
});
```

服务端命令或资源示例只需把 `data` 换成对应字符串；实际命令是否存在及其返回结构，需要由应用的 Walnut 环境保证。

## 注意事项

- 普通查询和单项查询输入若不是对象，会以 `{ val: input }` 作为模板上下文。
- `load://` 通过 `Walnut.loadJson` 读取；命令通过 `Walnut.exec(..., { as: "json" })` 执行。
- 未提供 `data` 时，数据加载器返回空数组。
- 动态字典的 `input` 支持函数解释；非字符串结果会序列化为 JSON。

## 延伸阅读

- **源码入口**
  - `src/core/wn-dict.ts` —— 字典适配与安装实现。
  - `src/_types/wn-server-config.ts` —— `WnDictSetup` 类型。
- **相关文档**
  - [Walnut 服务单例](10-walnut-server.md) —— 字典背后的资源与命令调用。
