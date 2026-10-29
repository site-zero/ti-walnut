---
title: 快速上手
keywords: [快速上手, getting started, 安装, main.ts, Walnut.init, ServerConfig]
status: done
---

# 快速上手

## 安装

```bash
npm install vue @site0/tijs @site0/ti-walnut
```

Ti Walnut 的组件基于 TiJS 注册体系，服务初始化也复用 TiJS 的国际化与全局 UI 能力，因此两个库需要一起接入。

## 初始化应用

下面的 `main.ts` 按源码中的注册和初始化顺序组织：

```ts
import { createApp } from "vue";
import {
  installTiComponents,
  installTiCoreI18n,
  updateInstalledComponentsLangs,
} from "@site0/tijs";
import { Walnut, installWalnutI18n } from "@site0/ti-walnut";
import App from "./App.vue";

const lang = "zh-cn";
installTiCoreI18n(lang);
installWalnutI18n(lang);

// 导入 @site0/ti-walnut 时，src/lib/index.ts 已调用 tiPutComponents。
const app = createApp(App);
installTiComponents(app);
updateInstalledComponentsLangs(lang);

await Walnut.init({
  protocal: "http",
  host: "localhost",
  port: 8080,
  apiPrefix: "/api",
  lang,
});

app.mount("#app");
```

`Walnut.init` 会保存服务配置，安装语言与字典等公共资源。`protocal` 是源码中的既有拼写，配置时不要改成 `protocol`。

如果应用由服务端页面输出 `<body server-config="..." server-base="...">` 等属性，也可以先调用 `Walnut.loadSettingFromDocument(document, version, title)`，再调用 `Walnut.prepare()` 读取远程配置。

## ServerConfig 最小配置

- **`protocal`（`"http" | "https"`，必填）**：服务协议。
- **`host`（`string`，必填）**：服务主机。
- **`port`（`number`，必填）**：服务端口；`getUrl` 对端口 `80` 不输出显式端口。
- **`apiPrefix`（`string`，可选）**：API 前缀；调用 `getApiUrl` 时必须已配置。
- **`lang`（`I18nLang`，可选）**：初始化 TiJS 与 Ti Walnut 语言包。
- **`site` / `domain`（`string`，可选）**：登录站点和域配置。
- **`i18n` / `dicts`（可选）**：服务端公共资源声明。

## 放置登录组件

注册名是 `WnSignin`（小写第二个 `i`），不是 `WnSignIn`：

```xml
<WnSignin :err-code="session.data.errCode" @submit="onSignIn" />
```

```ts
import { useSessionStore } from "@site0/ti-walnut";

const session = useSessionStore();

async function onSignIn(info: { username?: string; password?: string }) {
  await session.signIn(info, async () => {
    // 登录成功后加载应用自己的数据。
  });
}
```

组件只收集并提交表单；`useSessionStore` 才负责调用服务、保存会话和记录错误码。

## 放置对象浏览器

```xml
<WnObjBrowser load-mode="worker" home-path="~" />
```

`worker` 模式让组件根据 `homePath` 主动加载。若上层已经准备好 `objList` 与 `objPath`，使用 `puppet` 模式由外部数据驱动。

## 下一步

- 对象 CRUD 与查询：阅读 [useWnObj](../40.features/use-wn-obj.md)。
- SQLX 查询：阅读 [useSqlx](../40.features/use-sqlx.md)。
- 标准列表的查询、选择、编辑与保存：阅读 [标准对象列表 store](../50.stores/std-list.md)。

## 延伸阅读

- **源码入口**
  - `src/lib/index.ts` —— 组件加入 TiJS 注册表。
  - `src/core/wn-server.ts` —— 服务初始化、配置和会话请求。
  - `src/i18n/index.ts` —— Ti Walnut 语言包安装。
  - `src/lib/view/misc/signin/WnSignIn.vue` —— 登录表单事件。
  - `src/lib/_store/use-session.store.ts` —— 登录动作。
- **相关文档**
  - [服务与会话](../10.concepts/03-server-session.md) —— 理解票据和 store 的分工。
  - [组件注册](../10.concepts/02-component-registration.md) —— 理解导入副作用与注册名。
