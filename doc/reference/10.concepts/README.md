---
title: 核心概念机制
keywords: [概念, 架构, 组件注册, 会话, 对象模型, store]
status: done
---

# 核心概念机制

Ti Walnut 不是一套孤立的 Vue 组件集合。它把 Walnut 服务调用、响应式状态与 TiJS 动态组件体系接成一条数据链。概念篇只解释这些共同地基，具体 API 放到后续分区。

## 篇目

1. [架构分层](01-architecture.md)：core、features、stores、components 如何协作。
2. [组件注册](02-component-registration.md)：导入副作用、注册名与目录分类。
3. [服务与会话](03-server-session.md)：服务单例、票据和响应式会话状态。
4. [对象模型](04-obj-model.md)：`WnObj`、路径、元数据和内容的边界。
5. [数据 store](05-data-stores.md)：远端快照、本地草稿和保存冲突。

## 延伸阅读

- **源码入口**
  - `src/core/`、`src/lib/_features/`、`src/lib/_store/`、`src/lib/view/` —— 四个主要层次。
- **相关文档**
  - [快速上手](../00.start-here/01-getting-started.md) —— 先跑通初始化再读机制。
