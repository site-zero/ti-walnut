---
title: WnObjUploadTile 单对象上传贴片
keywords: [WnObjUploadTile, 单对象上传贴片, 组件, INPUT]
status: draft
---

# `WnObjUploadTile` 单对象上传贴片

## 介绍

`WnObjUploadTile` 是默认组件集中的单对象上传贴片，注册 `TiComRace` 为 `INPUT`。源码目录：`src/lib/input/obj-upload-tile/`。

本篇目前提供稳定的组件定位与源码阅读入口。Props、Events、默认值和调用示例尚未逐项核对，因此保持 `draft`，不应据此推断完整 API。

## 源码阅读顺序

1. 从注册表确认组件名、`race` 与默认配置。
2. 从类型文件提取 Props 与 Emitter。
3. 从 Vue 文件核对 `withDefaults`、事件接线与插槽。
4. 涉及异步动作时，继续阅读同目录 `use-*.ts` 或 `support/`。

## 延伸阅读

- **源码入口**
  - `src/lib/input/obj-upload-tile/wn-obj-upload-tile-index.ts` —— 注册信息与实现导出。
  - `src/lib/input/obj-upload-tile/wn-obj-upload-tile-types.ts` —— Props、事件或相关类型。
  - `src/lib/input/obj-upload-tile/WnObjUploadTile.vue` —— 视图模板与状态接线。
- **相关文档**
  - [组件总目录](../../README.md) —— 查看组件分类与同层组件。
