---
title: 组件注册模型
keywords: [组件注册, TiComInfo, tiPutComponents, installTiComponents, 注册名]
status: done
---

# 组件注册模型

## 要解决的问题

Ti Walnut 组件既要在 Vue 模板中使用，也要能被 TiJS 的 schema 动态渲染。两种用法需要同一份组件名、默认配置和实现映射。

## 解决思路

```text
每个组件的 *-index.ts
  → 导出 WnXxxInfo: TiComInfo
  → 分类 index.ts 汇总为 TiComSet
  → src/lib/index.ts 调用 tiPutComponents
  → installTiComponents(app) 安装到 Vue
```

导入 `@site0/ti-walnut` 会执行 `src/lib/index.ts`，因此组件先进入 TiJS 注册表；应用仍需调用 `installTiComponents(app)` 完成 Vue 安装。

## 关键细节

- 模板名以 `COM_TYPE` / `WnXxxInfo.name` 为准，不从文件名猜测。例如登录组件注册为 `WnSignin`，懒代理注册为 `WnLazzyProxy`。
- 文档目录按源码目录分类；`TiComRace` 是组件注册元数据，两者可能不同。
- `WnSky` 有组件索引，但不在 `src/lib/index.ts` 汇总的默认组件集中；组件总目录只统计当前默认注册的 26 个组件。
- 修改注册名会影响模板与 schema，应同时检查分类索引、组件文档和调用方。

## 主要代码入口

- `src/lib/index.ts`：五类组件集的注册顺序。
- `src/lib/view/index.ts`：视图组件清单与注册名。
- 各组件 `*-index.ts`：`TiComInfo` 和实现导出。

## 延伸阅读

- **源码入口**
  - `src/lib/index.ts` —— 默认组件集注册。
  - `src/lib/view/index.ts`、`src/lib/input/index.ts` —— 分类组件集。
  - `src/lib/view/misc/signin/wn-signin-index.ts` —— 注册名与实现名不同的例子。
- **相关文档**
  - [组件总目录](../30.components/README.md) —— 当前默认注册组件的唯一全量清单。
