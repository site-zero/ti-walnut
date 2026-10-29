# Ti Walnut

`@site0/ti-walnut` 是基于 [TiJS](https://github.com/site-zero/tijs) 的 Walnut 前端适配库，为 [Walnut](https://github.com/zozoh/walnut) 后端服务提供专有组件、对象与 SQLX 数据访问、会话管理以及响应式数据 store。

## 能力分层

- **core**：`Walnut` 服务单例、命令执行、对象路径、字典、主题与 ID 工具。
- **components**：对象浏览/查看/编辑、上传、登录、Hub、RDS 等 26 个注册组件。
- **features**：`useWnObj`、`useSqlx`、上传与全局状态等可复用数据逻辑。
- **stores**：会话、标准对象列表、RDS 列表、本地编辑与界面状态。
- **types**：`WnObj`、`ServerConfig`、查询、上传和 store 等 TypeScript 契约。

## 快速接入

```bash
npm install @site0/tijs @site0/ti-walnut vue
```

```ts
import { createApp } from "vue";
import {
  installTiComponents,
  installTiCoreI18n,
  updateInstalledComponentsLangs,
} from "@site0/tijs";
import { Walnut, installWalnutI18n } from "@site0/ti-walnut";
import App from "./App.vue";

const lang = "zh-cn";
installTiCoreI18n(lang);
installWalnutI18n(lang);

// 引入 @site0/ti-walnut 时，组件已通过 tiPutComponents 加入 TiJS 注册表。
const app = createApp(App);
installTiComponents(app);
updateInstalledComponentsLangs(lang);

await Walnut.init({
  protocal: "http",
  host: "localhost",
  port: 8080,
  apiPrefix: "/api",
  lang,
});

app.mount("#app");
```

完整引导、配置说明和组件用法见 [`doc/reference/00.start-here/01-getting-started.md`](./doc/reference/00.start-here/01-getting-started.md)。

## 文档

- 文档入口：[`doc/README.md`](./doc/README.md)
- 参考手册：[`doc/reference/README.md`](./doc/reference/README.md)
- 全量索引：[`doc/reference/INDEX.md`](./doc/reference/INDEX.md)
- 源码对照：[`doc/reference/SOURCEMAP.md`](./doc/reference/SOURCEMAP.md)
- 写作规范：[`doc/skill/write-ti-walnut-doc.skill.md`](./doc/skill/write-ti-walnut-doc.skill.md)

```bash
# 检查 front-matter、索引覆盖、相对链接与源码路径
npm run docs:check

# 需要本机已安装 www-gen-site；输出到 dist/ti-walnut-www
npm run docs:build
```

文档各篇的 `status: draft | done | deprecated` 表示核对状态；`draft` 篇目可用于定位源码，但不代表 API 已逐项复核。文档与源码不一致时，以源码为准。

## 开发

```bash
npm install
npm run build
npm test
```

## License

[BSD-3-Clause](./LICENSE)
