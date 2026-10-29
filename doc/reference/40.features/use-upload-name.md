---
title: useUploadName 上传命名
keywords: [useUploadName, 上传命名, Tmpl, 时间, 会话]
status: done
---

# `useUploadName` 上传命名

## 解决什么问题

`useUploadName` 根据当前时间和会话用户生成上传名称，把命名模板需要的上下文集中在一个地方。

## 输入

- **`options.name`（`string | WnUploadFileNameRender`，可选）**：TiJS 模板字符串或自定义渲染函数；缺省模板为 `Upload-File-${now}`。当前上下文类型未声明 `now` 字段，使用自定义模板时应优先选择已定义字段。

## 返回值 API

返回一个无参数函数。每次调用都会重新生成上下文并渲染名称：

- `nowInSec`：`yyyyMMddHHmmss`。
- `nowInMin`：前 12 位，精确到分钟。
- `today`：前 8 位日期。
- `timeInSec` / `timeInMin`：当天时刻。
- `loginName`：当前登录名，缺省 `[anonymity]`。
- `nickname`：昵称，缺省回退到登录名。

```ts
const makeName = useUploadName({
  name: "avatar-${loginName}-${nowInSec}",
});

const filename = makeName();
```

## 延伸阅读

- **源码入口**
  - `src/lib/_features/use-upload-name.ts` —— 上下文生成与模板渲染。
  - `src/_types/wn-types.ts` —— 命名上下文和渲染函数类型。
- **相关文档**
  - [useWnObjUploader](use-wn-obj-uploader.md) —— 上传动作如何使用命名配置。
