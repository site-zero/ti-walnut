---
title: 对象与命令工具
keywords: [wn-util, genWnPath, normalizeFullPath, safeCmdArg, WnObj, 内容指纹]
status: done
---

# 对象与命令工具

## 职责

`wn-util.ts` 收拢对象操作中最常用的纯函数：清理命令参数、拼接对象路径、选择对象图标、提取内容指纹，以及判断内容是否适合文本编辑。

## 主要 API

- **`safeCmdArg(arg)`**：移除单引号、双引号和分号。
- **`safeObjForCmdArg(input)`**：递归处理数组和对象，其他值转字符串后清理。
- **`getWnObjIcon(obj, dft?)`**：从 `tp/mime/race/icon` 生成 TiJS 图标输入。
- **`genWnPath(base, subPath?)`**：保留 `id:`、`~/`、`/` 和 `~` 形式，其他相对路径拼到 `base`。
- **`normalizeFullPath(ph, vars, applyEnv = true)`**：按 `vars.HOME` 展开 `~`、按 `vars.PWD` 补全相对路径，默认使用 TiJS `Tmpl.exec` 展开模板变量，并保留输入的目录尾斜杠。
- **`getObjContentFinger(obj)`**：提取 `id/len/sha1/mime/tp`。
- **`isObjContentEditable(obj)`**：目录返回 `false`；文本与指定 JSON/JavaScript MIME 返回 `true`。
- **`parseObjId(id)`**：把 `homeId:selfId` 拆成两段，普通 ID 只返回 `selfId`。
- **`unwrapObjPath(path)`**：移除包裹整个路径的一对单引号或双引号。

## 典型用法

```ts
import {
  genWnPath,
  getObjContentFinger,
  normalizeFullPath,
} from "@site0/ti-walnut";

genWnPath("~/documents", "a.txt");       // ~/documents/a.txt
genWnPath("~/documents", "id:abc123");  // id:abc123

const env = { HOME: "/home/demo", PWD: "/home/demo/work", name: "notes" };
normalizeFullPath("~/path/to", env);           // /home/demo/path/to
normalizeFullPath("documents/", env);          // /home/demo/work/documents/
normalizeFullPath("~/${name}", env);           // /home/demo/notes
normalizeFullPath("~/${name}", env, false);    // /home/demo/${name}

const finger = getObjContentFinger({
  id: "abc123",
  len: 12,
  sha1: "...",
  mime: "text/plain",
  tp: "txt",
});
```

## 注意事项

- `safeCmdArg` 是命令参数清理策略，不是通用 shell 转义器；业务代码仍应避免拼接不可信命令文本。
- `normalizeFullPath` 对齐 Walnut Java 的 `NutBean vars` 重载，不查询 `id:` 对象，不折叠中间的 `.` 或 `..`，只清理末尾的 `/.`。例如 `./a` 在设置 `PWD` 后得到 `${PWD}/./a`。
- 空白输入原样返回；缺省 `PWD` 按空字符串处理，缺省 `HOME` 则不提供基础目录，结果不保证是以 `/` 开头的绝对路径。路径拼接会清理空白段与重复斜杠；模板展开在路径拼接之后进行，未定义的模板变量保留原占位符。
- `normalizeFullPath` 不清理命令参数；结果以空对象路径 `id:` 结尾时抛出错误。
- `WnObj` 允许扩展字段，因此这些工具只消费自己需要的字段，不要求封闭对象结构。
- `isObjContentEditable` 只判断当前 MIME 规则，不表示服务端一定允许写入。

## 延伸阅读

- **源码入口**
  - `src/core/wn-util.ts` —— 本篇全部函数。
  - `src/_types/wn-types.ts` —— `WnObj` 与 `WnObjContentFinger`。
- **相关文档**
  - [对象模型](../10.concepts/04-obj-model.md) —— 元数据、内容和路径的概念边界。
