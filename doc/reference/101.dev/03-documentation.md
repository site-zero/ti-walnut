---
title: 文档维护与验收
keywords: [文档维护, docs:check, docs:build, INDEX, SOURCEMAP]
status: done
---

# 文档维护与验收

## 内容分层

- `doc/reference/`：正式发布的使用与机制文档。
- `doc/skill/`：面向 Agent 和维护者的任务流程，不发布。
- `doc/note/`：过程笔记，不发布。
- `doc/ued/`：既有设计笔记，保留但不作为已核定 API 契约。
- `doc/www-gen-site.json5`：站点标题、导航生成、输出和排除规则。

## 每篇文档的最低契约

1. 有 `title/keywords/status` 三个 front-matter 字段。
2. 有且只有一个清晰 H1 主题。
3. 行为事实能定位到当前源码。
4. 正文末尾提供「延伸阅读」源码入口。
5. 能从 `INDEX.md` 进入，并在 `SOURCEMAP.md` 登记主要源码对应关系。

## 状态管理

- 新建登记页默认 `draft`。
- 逐项核对本篇声明范围后改为 `done`。
- 不为废弃能力写新的使用教程；保留迁移说明时使用 `deprecated`。
- 不把全站 `draft` 数量当作错误，检查脚本只验证状态字段合法性。

## 自动检查

```bash
npm run docs:check
```

`scripts/check-docs.mjs` 检查：

- reference 文档 front-matter 与 H1；
- Markdown 相对链接是否存在；
- 反引号中的源码根相对路径是否存在；
- 除 INDEX/SOURCEMAP 外，每篇 reference 是否被总索引收录。

## 构建站点

```bash
npm run docs:build
# 等价于
www-gen-site doc
```

站点输出到 `dist/ti-walnut-www`。`www-gen-site` 是外部文档生成器，当前未声明为仓库 devDependency；未安装时 `docs:build` 会失败，这不影响 `docs:check`。

## 修改源码后的同步

修改公开 Props、事件、默认值、服务行为或 store 数据流时，同步对应文档。只修改实现而不改变公开行为时，不必机械更新所有页面，但应保持 SOURCEMAP 的源码入口有效。

## 延伸阅读

- **源码入口**
  - `scripts/check-docs.mjs` —— 自动检查规则。
  - `doc/www-gen-site.json5` —— 站点生成配置。
  - `package.json` —— 文档脚本。
- **相关文档**
  - [编写 Ti Walnut 文档](../../skill/write-ti-walnut-doc.skill.md) —— 完整写作流程。
