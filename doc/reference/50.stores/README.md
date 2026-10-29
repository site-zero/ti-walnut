---
title: Stores 响应式数据模型
keywords: [stores, 响应式, StdList, RdsList, Session, 本地编辑]
status: done
---

# Stores 响应式数据模型

`src/lib/_store/` 使用 Vue 响应式 API 组织数据、选择和编辑状态，不要求额外的状态管理框架。不同 store 的共享范围不同：会话、侧边栏和视图模式使用模块级状态；列表与 meta 工厂通常每次创建独立模型。

## 篇目

- [会话与认证](session-auth.md)：共享会话、登录登出与账户角色组合模型。
- [标准对象列表](std-list.md)：对象查询、分页、选择、编辑、内容与冲突。
- [标准对象 Meta](std-meta.md)：单对象元数据与内容编辑。
- [RDS stores](rds.md)：SQLX 驱动的列表、单记录与简单模型。
- [本地编辑与内容](local-edit.md)：remote/local 差异和 SQL 变更生成。
- [GUI 与辅助 stores](gui-and-utils.md)：侧边栏、视图模式和实体 ID 缓存。

## 源码地图

- `auth/`：用户、角色、用户角色映射与密码重置。
- `std/`：标准 Walnut 对象列表和单对象。
- `rds/`：SQLX 列表、单记录和简单数据模型。
- `edit/`：本地列表、本地 meta、变更生成与差异。
- 根目录 `use-*.store.ts`：会话、内容、侧边栏、视图模式、实体 ID 等辅助模型。

## 延伸阅读

- **源码入口**
  - `src/lib/_store/index.ts` —— store 公共出口。
  - `src/lib/_store/wn-store-types.ts` —— 跨 store 的公共接口。
- **相关文档**
  - [数据 store 模型](../10.concepts/05-data-stores.md) —— 共同的状态与冲突概念。
