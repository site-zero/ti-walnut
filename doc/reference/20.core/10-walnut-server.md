---
title: Walnut 服务单例
keywords: [Walnut, WalnutServer, exec, fetchAjax, uploadFile, getUrl]
status: done
---

# `Walnut` 服务单例

## 职责

`Walnut` 是 `WalnutServer` 的全局单例，统一处理服务配置、会话票据、HTTP 请求、命令执行、对象内容 URL、动态 UI 资源和文件上传。业务代码通常直接导入单例，而不是自行创建多个服务实例。

```ts
import { Walnut } from "@site0/ti-walnut";
```

## 主要 API

### 初始化与配置

- **`loadSettingFromDocument(doc, appVersion, appTitle)`**：从 `<body>` 属性读取应用和服务配置入口。
- **`prepare()`**：加载远程 `server.config.json`，合并全局状态并调用 `init`。
- **`init(conf)`**：保存 `ServerConfig`，初始化语言、字典和公共资源。
- **`getConfig(key, dft?)`**：按 lodash 路径读取服务配置。
- **`getAppStaticPath(path)`**：拼接应用静态资源路径。

### URL 与请求

- **`getUrl(path, params?)`**：根据协议、主机和端口生成服务 URL，并序列化查询参数。
- **`getApiUrl(path, params?)`**：基于 `apiPrefix` 生成 API URL；未配置时抛错。
- **`getRequestInit(signal?, options?)`**：生成带 `X-Walnut-Ticket` 的请求初始化对象。
- **`fetchAjax(path, options?)`**：请求并返回 `AjaxResult` 形态的数据。
- **`fetchText` / `fetchJson`**：加载文本或 JSON 资源。

### 会话

- **`hasTicket()`**：判断服务层是否持有票据。
- **`fetchMySession()`**：读取当前会话，并同步时区环境。
- **`signInToDomain(info)`**：按站点配置选择登录端点。
- **`saveTicketToLocal(ticket, tz?)`**：同步内存、本地存储与时区。
- **`signOut()`**：登出当前会话，支持恢复父会话。

### 对象内容与命令

- **`getObj` / `fetchObj`**：按 ID 或路径获取对象。
- **`loadContent` / `loadContentAsList`**：加载对象内容。
- **`getUrlForObjContent`**：生成对象内容 URL，可控制下载方式、文件名和是否携带票据。
- **`getUrlForObjDownload` / `getUrlForObjOpen`**：生成下载或打开所需的 URL 与参数。
- **`exec(cmdText, options?)`**：执行 Walnut 命令，默认返回文本，`as: "json"` 时用 JSON5 解析。
- **`uploadFile(file, options)`**：上传文件，支持进度、取消和附加元数据。

## 典型用法

```ts
const obj = await Walnut.exec("o @fetch '~' @json -cqn", {
  as: "json",
});

const url = Walnut.getUrlForObjContent(obj.id, {
  download: "auto",
  withTicket: true,
});
```

上面的调用说明参数形态，不预设具体服务对象或返回内容。

## 注意事项

- `protocal` 是配置类型的既有字段名。
- 单例构造依赖浏览器 `document`，不适合直接在无 DOM 的 Node.js 环境实例化使用。
- `getRequestInit` 当前以传入 `options` 为基础，并生成票据头；调用方需要留意自定义 headers 的合并行为。
- `exec` 遇到 HTTP 401 会触发页面刷新；中止请求默认被视为可忽略，设置 `bearAbort: false` 可改为继续抛出。
- 使用 `withTicket` 会把票据放到内容 URL 查询参数中，应仅在确有访问需求时开启。

## 延伸阅读

- **源码入口**
  - `src/core/wn-server.ts` —— 类实现与 `Walnut` 单例。
  - `src/core/wn-run-command.ts` —— 命令传输与响应处理。
  - `src/_types/wn-server-config.ts` —— 服务配置类型。
  - `src/_types/wn-com-types.ts` —— 加载和执行选项类型。
- **相关文档**
  - [服务与会话](../10.concepts/03-server-session.md) —— 票据与响应式会话的关系。
