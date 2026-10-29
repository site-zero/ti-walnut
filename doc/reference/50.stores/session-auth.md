---
title: 会话与认证 stores
keywords: [useSessionStore, useAuthStore, 会话, 认证, 用户角色]
status: done
---

# 会话与认证 stores

## `useSessionStore`

会话 store 将 Walnut 登录响应转换为响应式 `UserSession`，包括票据、当前用户、环境变量、登录/过期时间、主组、主题、语言、时区和错误码。

状态 `SE` 定义在模块作用域，因此所有调用方共享同一会话。

```ts
const session = useSessionStore();

await session.reload(async () => {
  // 会话有效后的应用初始化。
});

console.log(session.hasTicket.value, session.data.me);
```

主要动作：

- **`signIn(info, afterOk)`**：登录并转换会话；成功后执行异步回调，失败记录 `errCode`。
- **`reload(afterOk)`**：重新获取当前会话；失败重置为未登录。
- **`signOut()`**：退出当前会话，存在父会话时恢复父会话。
- **`switchSession(newTicket, exit, oldTicket?)`**：切换或退出嵌套会话。
- **`resetSession()`**：清理本地响应式状态并移除 body 的会话票据属性。

## `useAuthStore`

认证 store 面向用户、角色、用户角色映射管理界面。它按配置分别为三组数据选择 `std` 或 `rds` store，并组合当前项、角色映射、加载/保存状态与密码重置动作。

配置中的 `userStoreType`、`roleStoreType`、`userRoleMappingStoreType` 决定三组数据各自使用哪种模型；选择某类型时要提供对应的 `StdListStoreOptions` 或 `RdsListStoreOptions`。

## 注意事项

- `signIn` 与 `reload` 的 `afterOk` 参数在源码类型中是必填函数，调用时提供异步空函数或实际初始化逻辑。
- 会话票据同时涉及服务单例、本地存储和响应式状态，不要只修改其中一处。
- `useAuthStore` 是三个列表模型的组合器，不替代 `useSessionStore` 的当前登录身份。

## 延伸阅读

- **源码入口**
  - `src/lib/_store/use-session.store.ts` —— 共享会话状态和动作。
  - `src/lib/_store/auth/use-auth.store.ts` —— 用户角色组合模型。
  - `src/lib/_store/auth/use-auth-reset-passwd.ts` —— 密码重置流程。
  - `src/lib/_store/auth/auth-user-roles.ts` —— 用户角色转换。
- **相关文档**
  - [服务与会话](../10.concepts/03-server-session.md) —— 服务层票据与 store 的关系。
  - [RDS stores](rds.md)、[标准对象列表](std-list.md) —— 认证 store 可组合的两类列表。
