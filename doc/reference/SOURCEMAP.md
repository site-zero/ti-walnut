---
title: 源码文档对照
keywords: [SOURCEMAP, 源码对照, 路径映射, 文档维护]
status: done
---

# 源码 ↔ 文档对照

> 按源码模块登记主要文档入口。新增源码行为或移动文档时同步更新；完整组件清单仍以组件总目录为准。

## 包入口与分层

| 源码路径 | 文档 |
| --- | --- |
| `index.d.ts` | [参考手册](README.md)、[源码布局](101.dev/01-source-layout.md) |
| `src/core/index.ts`、`src/core/wn.ts` | [Core 分区](20.core/README.md)、[架构分层](10.concepts/01-architecture.md) |
| `src/lib/index.ts` | [组件注册](10.concepts/02-component-registration.md)、[快速上手](00.start-here/01-getting-started.md) |
| `src/lib/_features/index.ts` | [Features 分区](40.features/README.md) |
| `src/lib/_store/index.ts` | [Stores 分区](50.stores/README.md) |
| `src/i18n/index.ts` | [快速上手](00.start-here/01-getting-started.md) |

## 服务、对象与命令

| 源码路径 | 文档 |
| --- | --- |
| `src/core/wn-server.ts` | [Walnut 服务单例](20.core/10-walnut-server.md)、[服务与会话](10.concepts/03-server-session.md) |
| `src/core/wn-run-command.ts` | [Walnut 服务单例](20.core/10-walnut-server.md)、[服务与会话](10.concepts/03-server-session.md) |
| `src/_types/wn-server-config.ts` | [快速上手](00.start-here/01-getting-started.md)、[Walnut 字典适配](20.core/30-wn-dict.md) |
| `src/core/wn-util.ts` | [对象与命令工具](20.core/20-wn-util.md)、[对象模型](10.concepts/04-obj-model.md) |
| `src/_types/wn-types.ts` | [对象模型](10.concepts/04-obj-model.md)、[对象与命令工具](20.core/20-wn-util.md) |
| `src/core/wn-dict.ts` | [Walnut 字典适配](20.core/30-wn-dict.md) |
| `src/lib/_store/use-session.store.ts` | [服务与会话](10.concepts/03-server-session.md)、[会话与认证](50.stores/session-auth.md) |

## 组件注册清单

| 源码路径 | 文档 |
| --- | --- |
| `src/lib/edit/setup-theme/` | [WnSetupTheme](30.components/edit/wn-setup-theme.md) |
| `src/lib/edit/slider-editor/` | [WnSliderEditor](30.components/edit/wn-slider-editor.md) |
| `src/lib/input/obj-multi-upload-tiles/` | [WnObjMultiUploadTiles](30.components/input/wn-obj-multi-upload-tiles.md) |
| `src/lib/input/obj-title/` | [WnObjTitle](30.components/input/wn-obj-title.md) |
| `src/lib/input/obj-upload-bar/` | [WnObjUploadBar](30.components/input/wn-obj-upload-bar.md) |
| `src/lib/input/obj-upload-tile/` | [WnObjUploadTile](30.components/input/wn-obj-upload-tile.md) |
| `src/lib/shelf/lazy-proxy/` | [WnLazzyProxy](30.components/shelf/wn-lazzy-proxy.md) |
| `src/lib/tile/obj-thumb/` | [WnObjThumb](30.components/tile/wn-obj-thumb.md) |
| `src/lib/view/conflict/` | [WnConflictView](30.components/view/conflict/wn-conflict-view.md) |
| `src/lib/view/hub/hub-avatar/` | [WnHubAvatar](30.components/view/hub/wn-hub-avatar.md) |
| `src/lib/view/hub/hub-foot/` | [WnHubFoot](30.components/view/hub/wn-hub-foot.md) |
| `src/lib/view/hub/hub-session/` | [WnHubSession](30.components/view/hub/wn-hub-session.md) |
| `src/lib/view/hub/hub-sidenav/` | [WnHubSideNav](30.components/view/hub/wn-hub-side-nav.md) |
| `src/lib/view/hub/hub-sky/` | [WnHubSky](30.components/view/hub/wn-hub-sky.md) |
| `src/lib/view/misc/cmd-runner/` | [WnCmdRunner](30.components/view/misc/wn-cmd-runner.md) |
| `src/lib/view/misc/signin/` | [WnSignin](30.components/view/misc/wn-signin.md) |
| `src/lib/view/obj/obj-browser/` | [WnObjBrowser](30.components/view/obj/wn-obj-browser.md) |
| `src/lib/view/obj/obj-browser/skybar/` | [WnObjBrowserSkyBar](30.components/view/obj/wn-obj-browser-sky-bar.md) |
| `src/lib/view/obj/obj-gallery/` | [WnObjGallery](30.components/view/obj/wn-obj-gallery.md) |
| `src/lib/view/obj/obj-list/` | [WnObjList](30.components/view/obj/wn-obj-list.md) |
| `src/lib/view/obj/obj-meta/` | [WnObjMeta](30.components/view/obj/wn-obj-meta.md) |
| `src/lib/view/obj/obj-preview/` | [WnObjPreview](30.components/view/obj/wn-obj-preview.md) |
| `src/lib/view/obj/obj-table/` | [WnObjTable](30.components/view/obj/wn-obj-table.md) |
| `src/lib/view/obj/obj-viewer/` | [WnObjViewer](30.components/view/obj/wn-obj-viewer.md) |
| `src/lib/view/obj/obj-wall/` | [WnObjWall](30.components/view/obj/wn-obj-wall.md) |
| `src/lib/view/rds/rds-browser/` | [WnRdsBrowser](30.components/view/rds/wn-rds-browser.md) |

## Features

| 源码路径 | 文档 |
| --- | --- |
| `src/lib/_features/use-wn-obj.ts` | [useWnObj](40.features/use-wn-obj.md)、[标准对象列表](50.stores/std-list.md) |
| `src/lib/_features/use-sqlx.ts` | [useSqlx](40.features/use-sqlx.md)、[RDS stores](50.stores/rds.md) |
| `src/lib/_features/use-wn-obj-uploader.ts` | [useWnObjUploader](40.features/use-wn-obj-uploader.md) |
| `src/lib/_features/use-upload-name.ts` | [useUploadName](40.features/use-upload-name.md) |
| `src/lib/_features/use-global-status.ts` | [useGlobalStatus](40.features/use-global-status.md)、[架构分层](10.concepts/01-architecture.md) |
| `src/lib/_features/use-thing.ts` | [useThing](40.features/use-thing.md) |

## Stores

| 源码路径 | 文档 |
| --- | --- |
| `src/lib/_store/auth/` | [会话与认证](50.stores/session-auth.md) |
| `src/lib/_store/std/use-std-list.store.ts` | [标准对象列表](50.stores/std-list.md)、[数据 store 模型](10.concepts/05-data-stores.md) |
| `src/lib/_store/std/use-std-meta.store.ts` | [标准对象 Meta](50.stores/std-meta.md) |
| `src/lib/_store/rds/` | [RDS stores](50.stores/rds.md) |
| `src/lib/_store/edit/use-local-list-edit.ts` | [本地编辑与内容](50.stores/local-edit.md) |
| `src/lib/_store/edit/use-local-meta-edit.ts` | [本地编辑与内容](50.stores/local-edit.md) |
| `src/lib/_store/use-obj-content.store.ts` | [本地编辑与内容](50.stores/local-edit.md)、[对象模型](10.concepts/04-obj-model.md) |
| `src/lib/_store/use-sidebar.store.ts` | [GUI 与辅助 stores](50.stores/gui-and-utils.md) |
| `src/lib/_store/use-gui-view-measure.store.ts` | [GUI 与辅助 stores](50.stores/gui-and-utils.md) |
| `src/lib/_store/use-entity-id.store.ts` | [GUI 与辅助 stores](50.stores/gui-and-utils.md) |

## 文档工程

| 源码路径 | 文档 |
| --- | --- |
| `scripts/check-docs.mjs` | [文档维护与验收](101.dev/03-documentation.md) |
| `doc/www-gen-site.json5` | [文档维护与验收](101.dev/03-documentation.md) |
| `doc/skill/write-ti-walnut-doc.skill.md` | [开发者参考手册](101.dev/README.md) |
| `package.json`、`vite.config.ts`、`tsconfig.json` | [开发者参考手册](101.dev/README.md) |
