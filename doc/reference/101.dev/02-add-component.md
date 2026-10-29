---
title: 新增一个组件
keywords: [新增组件, TiComInfo, 注册, 导出, 文档]
status: done
---

# 新增一个组件

## 1. 选择目录与注册名

按主要职责放入 `src/lib/edit|input|shelf|tile|view/`。目录名、文件名使用现有 kebab-case 约定，Vue 组件与类型使用 `WnXxx` 命名。

注册名以 `TiComInfo.name` 为准，必须与模板和 schema 预期一致；不要沿用笔误或随意改名。

## 2. 定义类型与视图

在 `wn-xxx-types.ts` 定义 Props、Emitter 和必要的内部类型。Vue 文件中通过 `defineProps`、`withDefaults`、`defineEmits` 接线；共享能力优先复用 TiJS 与本库 features/stores。

## 3. 编写组件索引

在 `wn-xxx-index.ts` 创建 `WnXxxInfo: TiComInfo`：

- 指定 `name`、`race`、`com`、`text` 和必要的 `i18n`；
- 导出 Vue 实现、组件信息与公共类型；
- 按现有组件模式提供 `install`、`defaultProps`、`exampleProps`。

## 4. 加入分类组件集

在所属分类的 `index.ts` 中：

1. 导入 `WnXxxInfo`；
2. 在默认 `TiComSet` 中加入 `WnXxx: WnXxxInfo`；
3. 导出组件索引。

`src/lib/index.ts` 已注册五个分类组件集，通常不需要为新组件重复调用 `tiPutComponents`。

## 5. 补充文档

1. 在 `doc/reference/30.components/<分类>/` 新建组件篇，先标 `status: draft`。
2. 从索引、类型、Vue 和内部 hook 逐项核对 Props、Events、默认值与示例。
3. 更新组件总目录、`INDEX.md` 和 `SOURCEMAP.md`。
4. 核对完成后才将状态改为 `done`。

## 6. 验证

```bash
npm run build
npm run docs:check
```

若增加了可独立验证的数据逻辑，同时补充并运行 Vitest 测试。当前仓库没有 `src/test/` 测试目录，新增测试时应同步更新本节与测试命令说明。

## 延伸阅读

- **源码入口**
  - `src/lib/index.ts`、`src/lib/view/index.ts` —— 分类注册方式。
  - `src/lib/view/obj/obj-viewer/wn-obj-viewer-index.ts` —— 组件索引示例。
- **相关文档**
  - [组件注册模型](../10.concepts/02-component-registration.md) —— 注册链路和命名规则。
  - [文档维护与验收](03-documentation.md) —— 文档同步与检查。
