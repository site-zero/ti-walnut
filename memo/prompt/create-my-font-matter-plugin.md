我的项目是 Vue3+vite+ts, 是一个库项目，我的其中一个组件，采用了 markdown-it，
我希望为 markdown-it 添加一个插件，以便解析 markdown 文档的头信息，它的格式
就是一种 github markdown 方言，格式如下:

```md
---
title: HTTP注册接口
author: zozohtnt@gmail.com
key: c1-api
---

... 这里是 markdown 正文

```

现有的 `markdown-it-front-matter` 插件我看似乎很久没有更新了，我装载了它，
它并不能和我现在的 `markdown-it 14.1.0` 很好的工作，编译都是失败的。
这让我对它失去了信心。

我觉得 这个插件应该比较容易实现。 你能不能通过一个ts文件替我实现这个插件呢 ?
譬如我需要你提供一个 `use-markdown-front-matter.ts` 里面就是插件的内容

我大概想的用法是，这个插件 `use-markdown-front-matter.ts` 输出一个
`markdownItFrontMatterPlugin` 的函数作为插件的入口点

我在使用这个插件的时候可以指定：

1. 如何渲染前置内容
   - ignore: 不渲染
   - table: 渲染为表格
   - list: 渲染为 UL/LI 列表
2. 如何获取前置内容
   > 我会声明一个回调函数，接受一个 `Record<string, any>` 的参数
   > 插件会把根据 yml 格式解析好的内容传递给我