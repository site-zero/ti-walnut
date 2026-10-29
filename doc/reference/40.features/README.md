---
title: Features 数据与交互能力
keywords: [features, composable, useWnObj, useSqlx, 上传, 全局状态]
status: done
---

# Features 数据与交互能力

`src/lib/_features/` 是组件与 core 之间的可复用 composable 层。这里不包含 Vue 视图，主要封装对象、SQLX、上传和应用级状态。

## 篇目

- [useWnObj](use-wn-obj.md)：Walnut 对象 CRUD、查询、祖先路径和内容读写。
- [useSqlx](use-sqlx.md)：SQLX 查询、计数与事务执行。
- [useWnObjUploader](use-wn-obj-uploader.md)：对象选择、上传、删除与值形态转换。
- [useUploadName](use-upload-name.md)：按时间与会话上下文生成上传名。
- [useGlobalStatus](use-global-status.md)：应用级加载、保存、选择与进度状态。
- [useThing](use-thing.md)：既有 Thing 数据集的读取、创建和更新。

## 延伸阅读

- **源码入口**
  - `src/lib/_features/index.ts` —— 公共导出入口。
- **相关文档**
  - [架构分层](../10.concepts/01-architecture.md) —— features 与 core/stores 的分工。
  - [Stores 数据模型](../50.stores/README.md) —— 数据动作如何转为界面状态。
