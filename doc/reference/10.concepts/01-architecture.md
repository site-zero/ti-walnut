---
title: 架构分层
keywords: [架构, 分层, core, features, stores, components, 数据流]
status: done
---

# 架构分层

## 要解决的问题

直接在每个 Vue 组件里拼命令、维护票据和编辑草稿，会让同一个对象操作出现多套实现。Ti Walnut 把「服务访问」「可复用动作」「界面状态」「视图」分开，让组件只组合已有能力。

## 解决思路

```text
Vue 组件（src/lib/{view,input,edit,tile,shelf}）
  │ 读取状态、转发用户动作
  ▼
Stores（src/lib/_store）
  │ 维护远端快照、本地草稿、查询、选择与加载状态
  ▼
Features（src/lib/_features）
  │ 对象 CRUD、SQLX、上传、全局状态
  ▼
Core（src/core）
  │ Walnut 单例、命令执行、路径、字典与主题
  ▼
Walnut HTTP 服务
```

- **core** 提供与具体控件无关的服务和工具；`Walnut` 是全局服务单例。
- **features** 把一类数据操作封装成 composable，例如 `useWnObj` 和 `useSqlx`。
- **stores** 用 Vue `ref/reactive/computed` 组织可编辑数据与动作状态，不等同于 Pinia 插件。
- **components** 通过 TiJS 注册表暴露，并把用户交互接到 features 或 stores。

并非每个组件都必须经过完整四层。简单展示组件可以直接读取 Props；需要保存、冲突检测或远程查询时，store 层才体现价值。

## 关键细节

- `src/lib/index.ts` 同时承担组件注册副作用和库导出，不只是类型索引。
- `src/_types/` 是公共契约层，被各层共享；它不应承载业务流程。
- `Walnut` 单例与模块级 session 状态意味着同一个页面默认共享服务身份。
- 独立调用 store 工厂是否共享数据，要看状态声明在模块作用域还是工厂函数内部，不能一概而论。

## 主要代码入口

- `WalnutServer`：HTTP、命令、内容和上传的服务入口。
- `useWnObj` / `useSqlx`：对象与 SQLX 数据操作。
- `useStdListStore` / `useRdsListStore`：两类列表数据模型。
- `src/lib/index.ts`：组件注册与公共导出。

## 延伸阅读

- **源码入口**
  - `src/core/index.ts`、`src/lib/index.ts` —— 分层导出入口。
  - `src/lib/_store/use-session.store.ts` —— 模块级共享状态的例子。
  - `src/lib/_store/std/use-std-list.store.ts` —— 工厂内独立状态的例子。
- **相关文档**
  - [数据 store](05-data-stores.md) —— 远端与本地状态如何组合。
