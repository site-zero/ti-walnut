---
title: 仓库源码布局
keywords: [源码布局, src, core, lib, types, index]
status: done
---

# 仓库源码布局

```text
ti-walnut/
├─ index.d.ts                 # 包总出口：types/core/i18n/lib
├─ src/
│  ├─ _types/                # 公共 TypeScript 契约
│  ├─ core/                  # 服务单例、命令、路径、字典、主题与 ID
│  │  └─ support/            # core 内部支持逻辑
│  ├─ i18n/                  # 库级语言包
│  └─ lib/
│     ├─ _features/          # 可复用 composable 数据能力
│     ├─ _store/             # 响应式数据模型
│     ├─ _support/           # 跨模块内部支持
│     ├─ edit/               # 编辑与配置组件
│     ├─ input/              # 对象输入与上传组件
│     ├─ shelf/              # 容器组件
│     ├─ tile/               # 小片组件
│     └─ view/               # 视图组件
├─ doc/
│  ├─ reference/             # 正式参考手册
│  ├─ skill/                 # Agent/维护者任务流程，不发布
│  ├─ note/                  # 非正式笔记，不发布
│  └─ www-gen-site.json5     # 文档站配置
├─ scripts/check-docs.mjs     # 文档结构与链接检查
├─ typedoc.json               # TypeDoc API 入口配置
└─ vite.config.ts             # 库构建配置
```

## 包入口

`index.d.ts` 依次导出 `src/_types`、`src/core`、`src/i18n`、`src/lib`。`src/lib/index.ts` 在导出前执行五组 `tiPutComponents`，因此导入库具有组件注册副作用。

## 组件目录组成

常见组件目录包含：

- `*-index.ts`：`TiComInfo`、注册名、`race`、实现和类型导出。
- `*-types.ts`：Props、Emitter 与相关契约。
- `WnXxx.vue`：模板、默认 Props、事件和样式接线。
- `use-*.ts`：组件内部计算和动作。
- `support/`、`i18n/`、`*.scss`：按需存在的支持文件。

并非每个组件都具备全部文件，以实际目录为准。

## 延伸阅读

- **源码入口**
  - `index.d.ts`、`src/lib/index.ts` —— 包与组件入口。
  - `src/lib/view/obj/obj-viewer/` —— 较完整组件目录示例。
- **相关文档**
  - [架构分层](../10.concepts/01-architecture.md) —— 各源码层次的运行时关系。
