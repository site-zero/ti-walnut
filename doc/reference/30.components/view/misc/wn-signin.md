---
title: WnSignin 登录表单
keywords: [WnSignin, WnSignIn, 登录, 表单, submit, session]
status: done
---

# `WnSignin` 登录表单

## 介绍

`WnSignin` 是视图类（`VIEW`）登录表单，负责收集用户名、密码并发出 `submit`。它不包含服务请求或票据保存逻辑，这些由 `useSessionStore` 完成。

模板注册名是 **`WnSignin`**；源码组件文件名是 `WnSignIn.vue`，两者不要混淆。源码目录：`src/lib/view/misc/signin/`。

## 例子

### JSON 配置

```json
{
  "username": "demo",
  "errCode": "e.auth.login.invalid"
}
```

### Vue 标签调用

```xml
<WnSignin
  username="demo"
  :err-code="session.data.errCode"
  @submit="onSignIn"
/>
```

```ts
import { useSessionStore } from "@site0/ti-walnut";

const session = useSessionStore();

async function onSignIn(info: { username?: string; password?: string }) {
  await session.signIn(info, async () => {
    // 登录成功后的应用初始化。
  });
}
```

## 控件参数

### 数据

- **`username`（`string`，可选）**：用户名输入框初始值。
- **`password`（`string`，可选）**：密码输入框初始值。
- **`errCode`（`string`，可选）**：非空时在表单底部通过 `I18n.get(errCode)` 显示错误。

### 行为

本组件无独立行为开关。点击提交时，用户名或密码为空会显示警告，不再发出 `submit`。

### 外观

- **`style`（`Vars`，可选）**：应用到根元素的样式对象。

### 回调

本组件无函数类型回调 Props；登录处理通过 `submit` 事件交给上层。

### 嵌套

- **`header`**：表单上方的自定义内容。
- **`footer`**：表单下方的自定义内容。

### 事件

- **`submit`**：载荷为 `{ username, password }`；两个字段均非空时，点击提交按钮触发。

## 总结

`WnSignin` 适合作为可嵌入不同页面布局的轻量登录表单。需要完整会话流程时配合 `useSessionStore`，不要把它当作自带服务初始化的独立登录页。

## 延伸阅读

- **源码入口**
  - `src/lib/view/misc/signin/wn-signin-index.ts` —— 注册名与组件信息。
  - `src/lib/view/misc/signin/WnSignIn.vue` —— Props、事件、插槽和空值校验。
  - `src/lib/_store/use-session.store.ts` —— 登录后的会话处理。
- **相关文档**
  - [服务与会话](../../../10.concepts/03-server-session.md) —— 登录事件之后的数据流。
