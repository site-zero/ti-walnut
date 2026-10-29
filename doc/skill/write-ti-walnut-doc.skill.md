# 编写 Ti Walnut 文档（write-ti-walnut-doc）

> 任务：在 `doc/reference/` 下新增或修订文档。先判断内容归属，再从源码抽取事实，最后同步索引并执行检查。

## 第 0 步：判断文档归属

一篇文档只回答一类问题，不要混型：

| 内容 | 位置 |
| --- | --- |
| 安装、引导、第一个可运行场景 | `doc/reference/00.start-here/` |
| 跨模块机制与设计边界 | `doc/reference/10.concepts/` |
| `src/core/` 的服务与工具 | `doc/reference/20.core/` |
| 一个注册组件的 Props、Events、示例 | `doc/reference/30.components/<分类>/` |
| `src/lib/_features/` 的 composable | `doc/reference/40.features/` |
| `src/lib/_store/` 的响应式数据模型 | `doc/reference/50.stores/` |
| 仓库工程流程 | `doc/reference/101.dev/` |
| 面向 Agent 的可复用执行套路 | `doc/skill/` |
| 阶段性笔记、踩坑与待办 | `doc/note/`（不发布） |

新增主题优先归入已有分区。确需新增顶层分区时，先与维护者确认。

## 1. 通用事实规则

1. **以当前 `src/` 为准。** Props、Events、默认值、命令、返回结构与行为边界必须能从源码定位；禁止凭印象或从其他库复制。
2. **TiJS 的通用机制不重复写。** 组件注册、共享 Props、字典基础模型等只说明 Ti Walnut 的扩展点，并链接到 TiJS 仓库的对应文档路径（纯文本路径即可）。
3. **Walnut 后端语义不重复写。** 命令完整语法、对象存储和权限模型属于 Walnut 后端文档；本库只写前端如何调用、如何处理结果。
4. **清单唯一。** 组件全量清单只维护在 `30.components/README.md`；其他页面只列相关组件，不复制全量清单。
5. **草稿不等于已核对。** 页面建立但 API 未逐项复核时保持 `status: draft`；只有完成本篇范围内的源码核对才改为 `done`。
6. **中文叙述。** 类型、Props、事件、命令、路径保持英文原样；代码注释使用中文。

## 2. front-matter 与正文

`doc/reference/` 下每篇都必须包含：

```yaml
---
title: WnObjBrowser 对象浏览器
keywords: [WnObjBrowser, 对象浏览器, WnObj, browser, view]
status: draft
---
```

- `title` 与正文 H1 呼应。
- `keywords` 使用行内数组，包含中英文检索词。
- `status` 只能是 `draft | done | deprecated`。
- 源码路径放正文末尾「延伸阅读」，不要扩展 front-matter 字段。

正文末尾固定设置：

```markdown
## 延伸阅读

- **源码入口**
  - `src/...` —— 一句话说明读取目的。
- **相关文档**
  - [相关篇目](relative.md) —— 一句话说明关联点。
```

## 3. 各类型模板

### 3.1 概念篇

依次写「要解决的问题」「解决思路」「关键细节」「主要代码入口」「延伸阅读」。优先用 ASCII 图说明分层与数据流，不堆完整 API 清单。

### 3.2 core 篇

依次写「职责」「主要 API」「典型用法」「注意事项」「延伸阅读」。命令示例必须能从实现中核对；不要把未实际执行的服务端输出写成真实结果。

### 3.3 组件篇

源码阅读顺序固定为：

1. `*-index.ts`：注册名、`race`、默认配置与示例；
2. `*-types.ts`：Props 与 Emitter；
3. `*.vue`：`withDefaults`、实际事件接线与插槽；
4. `use-*.ts` / `support/`：行为边界和异步流程。

正文使用「介绍」「例子」「控件参数」「总结」「延伸阅读」。参数按数据、行为、外观、回调、嵌套、事件分组，使用无序列表，不使用宽大的 Props/Events 表。Vue 标签代码块统一标为 `xml`。

注册目录与 `TiComRace` 不一致时，两者都要如实说明。例如 `WnObjTitle` 位于 `src/lib/input/`，但注册 `race` 是 `VIEW`。

### 3.4 Feature 篇

依次写「解决什么问题」「输入」「返回值 API」「配合使用」「注意事项」「延伸阅读」。明确模块级缓存或单例状态；不要把每次调用都新建实例的 hook 写成共享 store。

### 3.5 Store 篇

依次写「职责」「配置」「状态与动作」「数据流」「注意事项」「延伸阅读」。区分：

- 模块级共享状态；
- 每次工厂调用新建的独立状态；
- 本地草稿与远端快照；
- 查询、选择、内容、全局状态之间的联动。

### 3.6 开发规范篇

只写本仓库已验证的目录、命令和流程。命令未运行时不得写「已验证通过」。

## 4. 格式与命名

- 文件名使用 kebab-case，如 `01-getting-started.md`。
- 每篇一个 H1；主节使用 `##`；「延伸阅读」与正文主节平级。
- 代码块必须标语言：`ts`、`xml`、`json`、`bash`、`text`。
- 文档链接使用相对路径；源码路径使用仓库根相对路径并放在反引号中。
- 不写空 TODO、HTML 注释占位或未核实的行为清单。

## 5. 写完必做

1. 更新 `doc/reference/INDEX.md`，保证每篇 reference 文档都能从总索引进入。
2. 更新 `doc/reference/SOURCEMAP.md`，登记主要源码入口与文档的对应关系。
3. 更新所属分区 `README.md` 的链接、数量或状态说明。
4. 执行 `npm run docs:check`，修复 front-matter、死链、索引遗漏与不存在的源码路径。
5. 如果修改了已有文档记录的源码行为，重新核对该篇示例、Props、Events 与状态说明。

## 6. 验收清单

- [ ] 内容归属唯一，没有复制 TiJS/Walnut 的完整通用文档。
- [ ] 每个行为事实都有明确源码入口。
- [ ] `status` 与真实核对程度一致。
- [ ] INDEX、SOURCEMAP、分区 README 已同步。
- [ ] `npm run docs:check` 通过。
- [ ] 若声称站点构建成功，已实际运行 `npm run docs:build`。
