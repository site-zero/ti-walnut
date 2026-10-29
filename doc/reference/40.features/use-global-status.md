---
title: useGlobalStatus 应用全局状态
keywords: [useGlobalStatus, getGlobalStatus, 全局状态, loading, process]
status: done
---

# `useGlobalStatus` 应用全局状态

## 解决什么问题

应用标题、加载/保存状态、当前对象、选择数量和长任务进度往往需要跨组件共享。`useGlobalStatus` 提供一个模块级单例 API，让这些状态不必经过每个组件逐层传递。

## 状态与动作

`GlobalStatus` 包含应用信息、服务配置入口、域和站点、加载/保存/删除/修改状态、长任务 `process`，以及列表选择和当前对象。

主要动作：

- **`setData(delta)` / `resetData()`**：局部更新或重置运行状态。
- **`setProcessing`**：设置全局处理中状态。
- **`setProcessProgress` / `updateProcess` / `setProcessAbort` / `pushProcessLog`**：更新长任务。
- **`setAppPath` / `getPathOfApp`**：应用路径状态。
- **`onListSelect`**：同步列表选择到全局状态。

## 单例规则

```ts
const a = useGlobalStatus();                    // 首次创建；后续默认 resetData
const b = getGlobalStatus();                    // 取得单例，不自动重置
const c = useGlobalStatus({ autoReset: false }); // 同义于不自动重置
```

`useGlobalStatus` 的 `autoReset` 默认是 `true`。这意味着后续调用可能清除已有运行状态；只读取或更新现有状态时应使用 `getGlobalStatus` 或显式关闭自动重置。

## 延伸阅读

- **源码入口**
  - `src/lib/_features/use-global-status.ts` —— 状态、动作和单例规则。
  - `src/core/wn-server.ts` —— 服务初始化对全局状态的写入。
- **相关文档**
  - [架构分层](../10.concepts/01-architecture.md) —— 应用级状态与独立 store 的区别。
