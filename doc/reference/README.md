---
title: Ti Walnut 参考手册
keywords: [参考手册, reference, Ti Walnut, 文档索引, Vue, Walnut]
status: done
---

# Ti Walnut 参考手册

> 面向二次开发者与 AI Agent 的 Ti Walnut 机制、服务、组件与数据模型手册。
> 总索引见 [`INDEX.md`](INDEX.md)，源码对照见 [`SOURCEMAP.md`](SOURCEMAP.md)。

## 分区导航

| 分区 | 内容 | 目录 |
| --- | --- | --- |
| 入门 | 安装、应用引导、服务初始化与第一个组件 | [`00.start-here/`](00.start-here/README.md) |
| 概念机制 | 分层、注册、会话、对象模型与数据流 | [`10.concepts/`](10.concepts/README.md) |
| core | `Walnut` 服务单例、路径和字典适配 | [`20.core/`](20.core/README.md) |
| 组件 | 当前 26 个注册组件的分类手册 | [`30.components/`](30.components/README.md) |
| features | 对象、SQLX、上传和全局状态 composable | [`40.features/`](40.features/README.md) |
| stores | 会话、标准对象、RDS、本地编辑与 GUI 状态 | [`50.stores/`](50.stores/README.md) |
| 开发规范 | 源码布局、新增组件和文档同步 | [`101.dev/`](101.dev/README.md) |

## 阅读建议

- **第一次接入**：按 `00.start-here/` 跑通引导，再读概念篇的架构与服务会话。
- **使用组件**：先在组件总目录按场景定位，再读对应页面和源码入口。
- **访问数据**：对象数据优先看 `useWnObj` 与标准 store；SQLX 数据看 `useSqlx` 与 RDS store。
- **修改仓库**：先读 `101.dev/` 和 `AGENT.md`，修改公开行为后同步文档。

## 状态口径

- `done`：本篇声明范围内已逐项核对源码。
- `draft`：已建立导航与源码定位，内容或 API 仍需继续复核。
- `deprecated`：已弃用，只保留迁移信息。

当前阶段以建立完整、可维护的文档系统为主；组件登记页多数为 `draft`，不应把它们当作逐项核定的 API 契约。

## 延伸阅读

- **源码入口**
  - `index.d.ts` —— 包总出口。
  - `src/core/index.ts`、`src/lib/index.ts` —— core 与 UI/数据层出口。
- **相关文档**
  - [文档写作规范](../skill/write-ti-walnut-doc.skill.md) —— 新增或修订文档时执行。
