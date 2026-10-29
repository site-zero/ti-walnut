# Ti Walnut 文档

`@site0/ti-walnut` 是 TiJS 与 Walnut 之间的前端适配层：向下封装 Walnut 命令、对象、会话和 SQLX 数据访问，向上提供可直接接入 Vue 3 应用的组件、composable 与响应式 store。

本站由 `www-gen-site` 从 `doc/` 目录生成，正式内容为 **reference 参考手册**：

- **入门与概念** —— 跑通应用引导，理解服务单例、会话、组件注册、对象模型与数据流；
- **core、组件、features 与 stores** —— 按使用单元查阅职责、示例、边界与源码入口；
- **开发规范** —— 面向仓库贡献者，说明源码布局、新增组件与文档同步流程。

仓库中的 `doc/skill/` 保存面向 AI Agent 的可复用写作流程，`doc/note/` 用于非正式过程笔记，两者均不发布。AI Agent 可从仓库根目录的 `AGENT.md` 开始阅读。

## 本地维护

```bash
# 在仓库根目录执行
npm run docs:check
npm run docs:build
```

`docs:check` 只依赖 Node.js；`docs:build` 需要本机已安装 `www-gen-site`，站点输出到 `dist/ti-walnut-www`。

> 下方栏目卡片可直接进入。各篇 front-matter 的 `status` 表示源码核对状态，而不是页面是否存在。
