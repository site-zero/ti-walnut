---
title: Core 服务与工具
keywords: [core, Walnut, WnUtil, 字典, 服务单例]
status: done
---

# Core 服务与工具

`src/core/` 提供与具体组件无关的 Walnut 前端能力。公共入口 `src/core/index.ts` 会把 `Wn` 命名空间挂到 `globalThis.Wn`（尚不存在时），并导出相同内容。

## 篇目

- [Walnut 服务单例](10-walnut-server.md)：配置、请求、命令、内容和上传。
- [对象与命令工具](20-wn-util.md)：路径、参数清理、对象图标和内容指纹。
- [Walnut 字典适配](30-wn-dict.md)：把命令和静态资源接入 TiJS 字典。

## 延伸阅读

- **源码入口**
  - `src/core/index.ts`、`src/core/wn.ts` —— 公共出口。
  - `src/core/support/` —— 时区等内部支持逻辑。
- **相关文档**
  - [架构分层](../10.concepts/01-architecture.md) —— core 在整体数据链中的位置。
