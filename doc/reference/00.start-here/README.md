---
title: 入门导引
keywords: [入门, start here, 安装, 引导, 快速上手]
status: done
---

# 入门导引

这一分区只解决一个问题：让 Vue 3 应用完成 TiJS、Ti Walnut 与 Walnut 服务的初始化，并能放置第一个组件。

```text
安装依赖
  → 安装语言包
  → 导入 Ti Walnut（组件进入 TiJS 注册表）
  → installTiComponents(app)
  → 初始化 Walnut 服务
  → 挂载应用
```

## 篇目

- [快速上手](01-getting-started.md)：完整 `main.ts`、`ServerConfig`、登录与对象组件示例。

## 延伸阅读

- **源码入口**
  - `src/lib/index.ts` —— 组件注册副作用与库导出入口。
  - `src/core/wn-server.ts` —— `Walnut.init` 初始化流程。
- **相关文档**
  - [架构分层](../10.concepts/01-architecture.md) —— 理解各初始化步骤属于哪一层。
