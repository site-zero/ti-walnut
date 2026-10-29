---
title: useWnObjUploader 对象上传
keywords: [useWnObjUploader, 上传, WnObjInput, valueType, abortUpload]
status: draft
---

# `useWnObjUploader` 对象上传

## 解决什么问题

对象上传控件不仅要上传 `File`，还要处理已有对象、预览、值格式、删除确认、选择文件和失败状态。`useWnObjUploader` 把这些动作集中为组件内部 composable。

## 输入

`WnObjUploaderProps` 的关键字段：

- **`value` / `valueType`**：当前值与输出形态；`valueType` 默认 `idPath`，支持 `obj`、`id`、`idPath`、`path`。
- **`upload`（必填）**：目标、模式、接受类型、命名等上传配置，不含进度和取消信号回调。
- **`mountHome`**：为两段式对象 ID 提供挂载目录前缀。
- **`canRemoveFile`（默认行为为允许）**：是否允许删除按钮自动删除文件。
- **`onRemoveFile` / `onOpenToChooseFile`**：删除与选择文件的自定义异步行为。

调用时还需传入 Emitter，以及由组件持有的对象和 base64 预览 `Ref`。

## 返回值 API

- **状态**：`ValueType`、`Preview`、`Text`、`Progress`、`FailMessage`、`isUploading`、`isInvalid`、`hasValue`。
- **动作**：`loadObj`、`doUpload`、`abortUpload`、`doRemoveFile`、`doChooseFile`。
- **事件**：`change`、`fail`、`choose-file`。

## 注意事项

- `path` 输出依赖 `obj.ph`，或可由 `pid/nm` 拼接；两者都不足时会抛错。
- 预览可以是本地文件、图片 base64 或对象图标。
- 本 composable 管理动作与状态，不负责定义组件模板。

## 延伸阅读

- **源码入口**
  - `src/lib/_features/use-wn-obj-uploader.ts` —— 上传、删除、选择和值转换。
  - `src/core/wn-server.ts` —— 底层 `uploadFile` 与上传配置。
  - `src/lib/input/obj-upload-bar/WnObjUploadBar.vue`、`src/lib/input/obj-upload-tile/WnObjUploadTile.vue` —— 消费组件。
- **相关文档**
  - [useUploadName](use-upload-name.md) —— 上传命名上下文。
  - [useWnObj](use-wn-obj.md) —— 对象读取与删除。
