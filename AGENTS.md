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

- **开发服务、命令与会话**：`src/core/wn-server.ts`、`src/lib/_store/use-session.store.ts`。
- **处理对象 CRUD 与查询**：`src/lib/_features/use-wn-obj.ts`、`src/core/wn-util.ts`。
- **使用 SQLX**：`src/lib/_features/use-sqlx.ts`、`src/_types/sql-types.ts`、`src/lib/_store/rds/`。
- **编写或修改组件**：先按下面「检索 TiJS skill」阅读适用的组件规范；再读 `src/lib/<分类>/<组件>/` 中的 `*-index.ts`、`*-types.ts`、Vue 视图与 `use-*.ts`。
- **维护标准对象/RDS store**：`src/lib/_store/std/`、`src/lib/_store/rds/`。
- **编写或更新文档**：先读 `doc/skill/write-ti-walnut-doc.skill.md`，写完执行 `npm run docs:check`。

## 检索 TiJS skill

涉及组件、样式、i18n、注册导出或其他受 TiJS 影响的开发任务时，必须执行以下步骤：

1. 根据任务关键词检索本仓库 `doc/skill/` 中的适用 skill。
2. 再检索 TiJS 的 `<TiJS根目录>/doc/skill/`；组件任务通常应命中
   `write-tijs-com.skill.md`，并按其要求继续阅读它引用的参考资料。
3. skill 与任务匹配时，先完整阅读该 skill 及明确要求阅读的资料，再开始修改代码。
4. 本仓库 skill 优先于 TiJS skill；本仓库未覆盖的规则遵守 TiJS 规范。

## 本地依赖参考

本仓库依赖 TiJS 的源码、文档与 skill。涉及 TiJS 时按以下顺序定位本地依赖：

1. 若项目根目录存在 `LOCAL_REF.md`，先读取其中列明的本地依赖路径；路径存在时直接使用。
2. 若不存在或没有列明 TiJS 路径，则检查与本仓库同级的 `../tijs`。
3. 两者都不存在时，立即停下并告知调用者未找到 TiJS 本地源码；询问调用者提供准确路径，还是授权联网搜索或阅读线上文档。

不要为了定位本地库而遍历整个磁盘、猜测无关目录或进行大范围搜索，以免浪费上下文与时间。

## 同步契约

- 行为事实以 `src/` 为准，不从旧文档猜测 Props、事件、默认值或命令输出。
- 修改公开行为时同步对应参考文档、INDEX 与 SOURCEMAP；仅措辞变化且索引信息不变时无需机械修改索引。
- 文档 `status: done` 只用于已逐项核对源码的篇目；其余保持 `draft`。
- 构建：`npm run build`；测试：`npm test`；文档检查：`npm run docs:check`。
