---
title: 开发者参考手册
keywords: [开发规范, 源码布局, 新增组件, 文档同步]
status: done
---

# 开发者参考手册

这一分区面向修改本仓库的开发者与 AI Agent，重点是可重复的工程流程，而不是使用方 API。

## 篇目

- [仓库源码布局](01-source-layout.md)：入口、分层和组件目录组成。
- [新增一个组件](02-add-component.md)：实现、注册、导出和文档同步步骤。
- [文档维护与验收](03-documentation.md)：状态口径、索引、检查与站点构建。

## 常用命令

```bash
npm install
npm run build
npm test
npm run docs:check
npm run docs:build
```

`docs:build` 需要本机已安装 `www-gen-site`；其他命令使用仓库现有 Node.js 工具链。

## 延伸阅读

- **源码入口**
  - `package.json`、`vite.config.ts`、`tsconfig.json` —— 构建与脚本契约。
  - `AGENTS.md` —— Agent 最少阅读路线。
- **相关文档**
  - [文档写作规范](../../skill/write-ti-walnut-doc.skill.md) —— 文档任务的完整流程。
