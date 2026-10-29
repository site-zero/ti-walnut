# Ti Walnut Agent 阅读入口

本仓库是 `@site0/ti-walnut`：基于 TiJS 的 Walnut 前端组件与数据访问库。修改代码或文档前，先按任务读取最少必要文件，不要通读 `dist/`、`node_modules/` 或 `.git/`。

## 最少阅读路线

1. `package.json`：包入口、依赖与构建命令。
2. `index.d.ts`：包的总出口。
3. `src/core/index.ts`、`src/core/wn.ts`：core 出口与 `Walnut` 服务单例。
4. `src/lib/index.ts`：组件注册与 features/stores/components 出口。
5. `src/_types/index.ts`：公共类型出口。
6. `doc/reference/INDEX.md`：文档导航；`doc/reference/SOURCEMAP.md`：源码到文档的反向定位。

## 按任务定位

- **服务、命令、会话**：`src/core/wn-server.ts`、`src/lib/_store/use-session.store.ts`。
- **对象 CRUD 与查询**：`src/lib/_features/use-wn-obj.ts`、`src/core/wn-util.ts`。
- **SQLX**：`src/lib/_features/use-sqlx.ts`、`src/_types/sql-types.ts`、`src/lib/_store/rds/`。
- **组件**：`src/lib/<分类>/<组件>/`，先读 `*-index.ts`、`*-types.ts`、Vue 视图，再读 `use-*.ts`。
- **标准对象/RDS store**：`src/lib/_store/std/`、`src/lib/_store/rds/`。
- **文档**：先读 `doc/skill/write-ti-walnut-doc.skill.md`，写完执行 `npm run docs:check`。

## 同步契约

- 行为事实以 `src/` 为准，不从旧文档猜测 Props、事件、默认值或命令输出。
- 修改公开行为时同步对应参考文档、INDEX 与 SOURCEMAP；仅措辞变化且索引信息不变时无需机械修改索引。
- 文档 `status: done` 只用于已逐项核对源码的篇目；其余保持 `draft`。
- 构建：`npm run build`；测试：`npm test`；文档检查：`npm run docs:check`。
