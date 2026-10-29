---
title: 服务与会话
keywords: [WalnutServer, 会话, session, ticket, useSessionStore, 登录]
status: done
---

# 服务与会话

## 要解决的问题

HTTP 请求需要统一服务地址和票据，界面又需要响应当前用户、环境变量、登录错误和过期时间。服务层与会话 store 分别承担传输和响应式状态，避免把两种职责揉进登录组件。

## 解决思路

```text
WnSignin.submit
  → useSessionStore.signIn
  → Walnut.signInToDomain
  → 保存 ticket 到 WalnutServer 与 localStorage
  → 转换响应为用户会话
  → 模块级 SE 驱动界面更新
```

`Walnut` 是 `WalnutServer` 单例。构造时从 `document.body` 的 `session-ticket` 或本地存储读取票据；请求通过 `X-Walnut-Ticket` 头携带。`useSessionStore` 内部的 `SE` 是模块级 `reactive` 对象，所以多次调用拿到的是同一会话状态。

## 关键细节

- 本地票据键为 `Walnut-Ticket`。
- `signInToDomain` 根据 `ServerConfig.site` 选择域账户或系统账户登录端点。
- `fetchMySession` 失败会清除服务层票据和本地存储；store 的 `reload` 再重置响应式会话。
- `signOut` 支持返回父会话；没有父会话时才回到未登录状态。
- 会话的 `env` 会提供 `HOME`、`PWD`、`THEME`、`TIMEZONE` 等运行环境，命令执行也会读取 `PWD`。
- 登录组件只发出 `submit`，不直接保存票据。

## 主要代码入口

- `WalnutServer`：票据、登录、登出和请求头。
- `useSessionStore`：响应式用户会话与登录动作。
- `wnRunCommand`：读取会话 `PWD` 并处理命令响应宏。

## 延伸阅读

- **源码入口**
  - `src/core/wn-server.ts` —— 服务单例和票据持久化。
  - `src/lib/_store/use-session.store.ts` —— 会话转换与共享状态。
  - `src/core/wn-run-command.ts` —— 命令请求与会话环境。
- **相关文档**
  - [Walnut 服务单例](../20.core/10-walnut-server.md) —— 服务 API 分组。
  - [会话与认证 store](../50.stores/session-auth.md) —— store 使用边界。
