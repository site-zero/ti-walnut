---
title: Walnut 对象模型
keywords: [WnObj, 对象模型, 元数据, 内容, 路径, idPath]
status: done
---

# Walnut 对象模型

## 要解决的问题

Walnut 的目录和普通文件都通过对象访问，但「对象元数据」与「文件内容」是两种不同的数据。前端如果混为一谈，就无法正确处理懒加载、保存状态和冲突。

## 解决思路

```text
WnObj（元数据）
  ├─ id / nm / race：标识、名称、DIR 或 FILE
  ├─ pid / ph：父级与路径信息（按加载结果而定）
  ├─ mime / tp / len / sha1：内容类型与指纹
  └─ title / icon / 业务字段：展示和自定义元数据

文件内容（text / json / base64 / 下载 URL）
  └─ 通过 id 或路径单独加载、修改和保存
```

`WnObj` 在公共类型中是 `Record<string, any>`，允许业务扩展字段；`isWnObj` 只做最低限度检查：`id` 为字符串、`race` 为 `DIR|FILE`、`nm` 为字符串。

## 关键细节

- `id:xxx` 是按 ID 定位的对象路径；`~` 和 `/...` 是路径定位形式。
- `genWnPath(base, subPath)` 保留绝对子路径，否则拼接基础路径，并清理命令参数中的引号和分号。
- `getObjContentFinger` 提取 `id/len/sha1/mime/tp`，内容 store 用它识别加载目标。
- 目录不可编辑内容；文本和若干 JSON/JavaScript MIME 类型由 `isObjContentEditable` 判为可编辑。
- 元数据更新不自动等于内容保存；标准 meta store 分别维护两种改动状态。

## 主要代码入口

- `isWnObj` / `toWnObj`：对象最低契约与转换。
- `useWnObj`：对象 CRUD、查询、内容和路径动作。
- `useObjContentStore`：内容远端快照、本地草稿与指纹。

## 延伸阅读

- **源码入口**
  - `src/_types/wn-types.ts` —— 对象与内容指纹类型。
  - `src/core/wn-util.ts` —— 路径、图标和内容可编辑判断。
  - `src/lib/_features/use-wn-obj.ts` —— 对象操作。
  - `src/lib/_store/use-obj-content.store.ts` —— 内容编辑状态。
- **相关文档**
  - [useWnObj](../40.features/use-wn-obj.md) —— 对象数据访问接口。
  - [WnObjViewer](../30.components/view/obj/wn-obj-viewer.md) —— 元数据、预览和内容的组合视图。
