---
title: 参考手册总索引
keywords: [INDEX, 索引, 文档目录, 篇目清单]
status: done
---

# 参考手册总索引

> 按分区汇总全部正式篇目。新增、删除或改名时同步更新本页、所属分区 README 与 SOURCEMAP。

## 总览

- [Ti Walnut 参考手册](README.md)：分区导航、阅读顺序与状态口径。

## 00.start-here 入门

- [入门导引](00.start-here/README.md)：初始化和第一个组件的阅读顺序。
- [快速上手](00.start-here/01-getting-started.md)：安装、`main.ts`、服务配置、登录与对象浏览器。

## 10.concepts 概念机制

- [核心概念机制](10.concepts/README.md)：共同地基与篇目导航。
- [架构分层](10.concepts/01-architecture.md)：core、features、stores、components 的数据流。
- [组件注册模型](10.concepts/02-component-registration.md)：导入副作用、注册名与目录分类。
- [服务与会话](10.concepts/03-server-session.md)：服务单例、票据和共享会话。
- [Walnut 对象模型](10.concepts/04-obj-model.md)：元数据、内容、路径和指纹。
- [数据 store 模型](10.concepts/05-data-stores.md)：远端快照、本地草稿和冲突。

## 20.core 服务与工具

- [Core 服务与工具](20.core/README.md)：core 分区导航。
- [Walnut 服务单例](20.core/10-walnut-server.md)：配置、请求、命令、内容和上传 API。
- [对象与命令工具](20.core/20-wn-util.md)：路径、参数、图标、指纹与内容判断。
- [Walnut 字典适配](20.core/30-wn-dict.md)：命令和资源接入 TiJS 字典。

## 30.components 组件

- [组件总目录](30.components/README.md)：当前 26 个默认注册组件的唯一全量清单。

### edit

- [WnSetupTheme](30.components/edit/wn-setup-theme.md)：主题设置编辑器登记页。
- [WnSliderEditor](30.components/edit/wn-slider-editor.md)：幻灯片编辑器登记页。

### input

- [WnObjMultiUploadTiles](30.components/input/wn-obj-multi-upload-tiles.md)：多文件上传贴片组登记页。
- [WnObjTitle](30.components/input/wn-obj-title.md)：对象图标、标题、提示和快捷重命名。
- [WnObjUploadBar](30.components/input/wn-obj-upload-bar.md)：单对象上传条登记页。
- [WnObjUploadTile](30.components/input/wn-obj-upload-tile.md)：单对象上传贴片登记页。

### shelf 与 tile

- [WnLazzyProxy](30.components/shelf/wn-lazzy-proxy.md)：懒加载代理容器登记页。
- [WnObjThumb](30.components/tile/wn-obj-thumb.md)：对象缩略卡片登记页。

### view · 冲突与 Hub

- [WnConflictView](30.components/view/conflict/wn-conflict-view.md)：冲突对比视图登记页。
- [WnHubAvatar](30.components/view/hub/wn-hub-avatar.md)：用户头像与会话入口登记页。
- [WnHubFoot](30.components/view/hub/wn-hub-foot.md)：Hub 底部状态与提示区登记页。
- [WnHubSession](30.components/view/hub/wn-hub-session.md)：Hub 会话操作区登记页。
- [WnHubSideNav](30.components/view/hub/wn-hub-side-nav.md)：Hub 侧边导航登记页。
- [WnHubSky](30.components/view/hub/wn-hub-sky.md)：Hub 顶部区域登记页。

### view · 对象

- [WnObjBrowser](30.components/view/obj/wn-obj-browser.md)：worker/puppet 对象浏览器完整用法。
- [WnObjBrowserSkyBar](30.components/view/obj/wn-obj-browser-sky-bar.md)：对象浏览器顶部操作条登记页。
- [WnObjGallery](30.components/view/obj/wn-obj-gallery.md)：对象展示形态登记页。
- [WnObjList](30.components/view/obj/wn-obj-list.md)：对象列表登记页。
- [WnObjMeta](30.components/view/obj/wn-obj-meta.md)：对象元数据表单登记页。
- [WnObjPreview](30.components/view/obj/wn-obj-preview.md)：对象内容预览登记页。
- [WnObjTable](30.components/view/obj/wn-obj-table.md)：对象表格登记页。
- [WnObjViewer](30.components/view/obj/wn-obj-viewer.md)：元数据、预览、内容与块事件路由。
- [WnObjWall](30.components/view/obj/wn-obj-wall.md)：对象墙贴布局登记页。

### view · RDS 与其他

- [WnRdsBrowser](30.components/view/rds/wn-rds-browser.md)：RDS 浏览与编辑视图登记页。
- [WnCmdRunner](30.components/view/misc/wn-cmd-runner.md)：命令输入与执行视图登记页。
- [WnSignin](30.components/view/misc/wn-signin.md)：登录表单 Props、事件、插槽与会话配合。

## 40.features 数据与交互能力

- [Features 分区导航](40.features/README.md)：composable 能力总览。
- [useWnObj](40.features/use-wn-obj.md)：对象 CRUD、查询、祖先路径与内容读写。
- [useSqlx](40.features/use-sqlx.md)：SQLX 查询、计数、执行与 DAO 缓存。
- [useWnObjUploader](40.features/use-wn-obj-uploader.md)：对象选择、上传、删除与值转换。
- [useUploadName](40.features/use-upload-name.md)：按时间与会话生成上传名。
- [useGlobalStatus](40.features/use-global-status.md)：应用级状态与单例重置规则。
- [useThing](40.features/use-thing.md)：既有 Thing 数据集读取、创建和更新。

## 50.stores 响应式数据模型

- [Stores 分区导航](50.stores/README.md)：store 分类与共享范围。
- [会话与认证](50.stores/session-auth.md)：共享会话和用户角色组合模型。
- [标准对象列表](50.stores/std-list.md)：对象查询、选择、编辑、内容和冲突。
- [标准对象 Meta](50.stores/std-meta.md)：单对象元数据与内容编辑。
- [RDS stores](50.stores/rds.md)：SQLX 列表、单记录和精简模型。
- [本地编辑与内容](50.stores/local-edit.md)：本地草稿、差异和 SQLX 变更。
- [GUI 与辅助 stores](50.stores/gui-and-utils.md)：侧边栏、布局模式和实体 ID 缓存。

## 101.dev 开发规范

- [开发者参考手册](101.dev/README.md)：工程流程与常用命令。
- [仓库源码布局](101.dev/01-source-layout.md)：包入口、分层和组件目录组成。
- [新增一个组件](101.dev/02-add-component.md)：类型、视图、注册、导出、文档与验证。
- [文档维护与验收](101.dev/03-documentation.md)：状态、索引、自动检查与站点构建。
