import {
  I18nLang,
  LayoutProps,
  SelectValueArm,
  SideBarItem,
  StrOptionItem,
  TiMatch,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { HubViewOptions } from "../_store";

export type AjaxResult = {
  ok: boolean;
  errCode?: string;
  msg?: string;
  data?: any;
};

export function isAjaxResult(re: any): re is AjaxResult {
  if (re && _.isBoolean(re.ok)) {
    return true;
  }
  return false;
}

export type WnObj = Record<string, any>;

export function isWnObj(obj: any): obj is WnObj {
  return (
    obj &&
    typeof obj === "object" &&
    _.isString(obj.id) &&
    _.isString(obj.pid) &&
    /^(DIR|FILE)$/.test(obj.race) &&
    _.isString(obj.nm)
  );
}

export type WnObjContentFinger = {
  id: string;
  len: number;
  sha1: string;
  mime: string;
  tp: string;
};

export type WnRace = "DIR" | "FILE";

export type WnObjQueryOptions = {
  /**
   * 为条件添加 d0:"home", d1:"主组" 两条约束
   */
  mine?: boolean;
  /**
   * 如果有隐藏对象，也要输出出来
   */
  hidden?: boolean;
  /**
   * 如果指定的父节点不存在，不要抛错，直接静默忍耐
   */
  quiet?: boolean;

  /**
   * 确保每个查询出来的对象是有全路径属性的
   */
  loadPath?: boolean;
};

export type WnObjInfo = {
  id?: string | null | undefined;
  ph?: string | null | undefined;
};

type ServerUISetup = {
  useStdFields?: boolean;
  useStdColumns?: boolean;
  fields?: string | string[];
  columns?: string | string[];
  viewSetup?: string;
};

export type UIViewSetup = {
  /**
   * 可以给扩展(譬如 WnHub)使用， 一个 dirName 具体
   * 可以对应到哪个对象绝对路径，
   * 如果没有指明，默认采用 ~/${dirName}
   *
   * 通常我们有下面的一些使用场景:
   *
   * 1) dirName=pet, objId=mgk34aqt5umn4
   * 2) dirName=pet, objId=xiaobai
   * 3) dirName=pet, objId=undefined
   *
   * 我们可以这么定义路径映射:
   *
   * ```
   * // 1) => '~/pet/'
   * // 2) => '~/pet/'
   * // 3) => '~/pet/
   * objPath: { 'pet': "~/pet" },
   *
   * // 1) => '~/pet/mgk34aqt5umn4'
   * // 2) => '~/pet/xiaobai'
   * // 3) => '~/pet/'
   * objPath: { pet: "~/pet/${objId}" },
   *
   * // 1) => 'id:mgk34aqt5umn4'
   * // 2) => '~/pet/xiaobai'
   * // 3) => '~/pet/'
   * objPath: {
   *   pet: [
   *      [ 'id:${objId}', {objId:'^[a-z0-9]{10,26}$'}],
   *      [ '~/pet/${objId}',{objId:'![BLANK]'}],
   *      '~/pet/${objId}',
   *   ]
   * },
   * // 这种模式的实现参见 util-select-value.ts
   * ```
   *
   * 如果没有声明对应的映射，三种情况输出的结果应该是:
   * // 1) => 'id:mgk34aqt5umn4'
   * // 2) => 'id:xiaobai'
   * // 3) => '~/pet'
   *
   * 如果想修改这个默认行为，你可以声明一个通用规则，譬如
   * // 1) => 'id:mgk34aqt5umn4'
   * // 2) => '~/pet/xiaobai'
   * // 3) => '~/pet/'
   * objPath: {
   *   '*': [
   *      [ 'id:${objId}', {objId:'^[a-z0-9]{10,26}$'}],
   *      [ '~/pet/${objId}',{objId:'![BLANK]'}],
   *      '~/pet/${objId}',
   *   ]
   * },
   */
  paths?: Record<string, SelectValueArm<string, Vars>>;

  /**
   * 指定一个 dirName 应该用哪个视图来呈现
   *
   * 譬如，界面上的 url 是 /user/t003
   * 那么 `dirName='user'; objId='t003`
   *
   * 则你可以这么定义:
   *
   * ```
   * // 直接指定 user 对应的视图全部信息:
   * views: { user: {  HubViewOptions } }
   *
   * // 你也可以将视图定义定义到某个系统文件里
   * views: { user: '~/.gui/user/user.view.json5' }
   *
   * // 或者是站点内的静态资源
   * views: { user: 'load://view/user.view.json' }
   * ```
   * 与 objPath 相同，字符串型的路径也是支持 `{dirName, objId}`
   * 作为上下文的模板渲染，如果是对象形式的，那么则支持 explain
   *
   * 对于下面的三个使用场景:
   *
   * 1) dirName=pet, objId=mgk34aqt5umn4
   * 2) dirName=pet, objId=xiaobai
   * 3) dirName=pet, objId=undefined
   *
   * 依然可以支持 `[ [val,match] ...]` 的选择，同时 '*'
   * 可以作为默认选择， 唯一不同的是，如果最后连  '*' 都没有匹配
   * 应该抛错
   */
  views?: Record<string, SelectValueArm<string | HubViewOptions, Vars>>;

  /**
   * 注册的应用列表
   */
  applications?: WnApplication[];

  /**
   * 配置编辑器可以被哪些对象打开
   */
  associations?: WnAssociation[];
};

export type WnAssociationInput = {
  /**
   * 关联的应用列表
   */
  apps: string[] | string;
  /**
   * 关联对象的匹配条件
   */
  test: any;
};

export type WnApplication = Omit<StrOptionItem, "style" | "className">;
export type WnAssociation = {
  /**
   * 关联的应用列表
   */
  apps: string[];
  /**
   * 关联对象的匹配条件
   */
  test: TiMatch;
};

export type DomainConfig = {
  lang?: I18nLang;
  ui?: ServerUISetup;
  /**
   * 指定了 i18n 资源文件的路径
   * {zh_cn: ['load://resources/i18n/zh_cn.json', '~/.i18n/zh_cn.json']]}
   * 每个资源文件，如果不是 'load://' 开头，必须登录以后才能读取
   * 这样，那些被登录之才能看到的界面（也就是主要界面）的文字可以交给标准数据模型动态管理
   * 当然为了考虑消息，你也可以不这么做，甚至将资源文件静态编译到代码里
   *
   * 如果语言没有匹配，则考虑降级重试，优先级为
   * 1) en-us
   * 2) en
   * 3) zh-cn  // 最后总是用 zh-cn 来兜底
   */
  i18n?: Record<string, string | string[]>;
  sidebar?: string;
  dicts?: string | string[];
};

export type ServerConfig = DomainConfig & {
  logo?: string;
  title?: string;
  protocal: "http" | "https";
  host: string;
  port: number;
  domain?: string;
  site?: string;
  // 指定受保护的设置，在一个应用需要跨越多个域使用的时候，
  // 我们需要每个域指定的 lang|ui|i18n|sidebar|dists|objPath|views
  // 都是不同，因此，我们可以指定 setup:"~/domain/setup.json"
  // 在登录后，即可获取相应配置
  setup?: string;
};

export type WnDictSetup = {
  /**
   * 动态字典，那么，会认为 data 为一个命令模板，上下文就是 Vars
   */
  dynamic?: boolean;
  /**
   * 动态字典命令模板执行的时候标准输入，需要 explain, 上下文就是 Vars
   */
  input?: any;

  /**
   * 字典如何获取标准字段
   */
  value?: string;
  text?: string;
  icon?: string | SelectValueArm<string, Vars>;
  tip?: string;

  /**
   * 字典如何获取数据
   */
  data?: string | Vars[];
  query?: string;
  item?: string;
};

export interface SignInForm {
  username?: string;
  password?: string;
}

export type WnExecOptions = {
  input?: string;
  as?: "json" | "text";
  signal?: AbortSignal;

  /**
   * 开启这个选项，将不采用 fetch 接口向服务器发起数据，
   * 而是采用 `navigator.sendBeacon()` 发送。
   * 通常在页面关闭的 `unload` 或者 `beforeunload` 时想执行
   * 一个命令，需要开启这个选项，以便确保请求能到达服务器
   */
  beacon?: boolean;
  /**
   * 明确指定为 `false` 遇到 abort 到值的运行异常则会抛出
   */
  bearAbort?: boolean;
  /**
   * 发送这个分隔符，服务器会在后面吧 Session 的环境变量
   * 更新一份出来，这样一个请求即完成了命令也更新了环境变量
   */
  mos?: string;
  /**
   * 命令输出的时候，服务器是否应该尽量强制输出缓冲里的信息
   * 以便让客户端尽快得到内容。
   * 如果我们运行一个长耗时的命令，这个选项或许是调用者期望的
   */
  forceFlushBuffer?: boolean;
};

export type WnLoadOptions = {
  signal?: AbortSignal;
  /**
   * 默认 false, 如果 true 表示即使加载不到资源
   * 也不要抛错，尽量容忍
   */
  quiet?: boolean;

  /**
   * 是否开启缓存 默认 false
   * 如果是 true, 那么会使用全局缓存
   * 如果是 Map<string, any> 那么会使用这个 Map 作为缓存
   */
  cache?: boolean | Map<string, any>;

  /**
   * 路径上带的 Query String
   */
  query?: Vars;
};

export type WnFetchObjOptions = WnLoadOptions & {
  loadAxis?: boolean;
  loadPath?: boolean;
};

export type UserSidebar = {
  statusStoreKey?: string;
  sidebar: SideBarItem[];
};

// export type StoreStatus = {
//   loading: boolean;
//   saving: boolean;
//   removing: boolean;
//   processing: boolean;
//   changed: boolean;
// };

export type WnMetaSaving = {
  update: (meta: Vars) => Promise<Vars | undefined>;
  create: (meta: Vars) => Promise<Vars | undefined>;
};

export type GuiViewLayout = {
  desktop: LayoutProps;
  pad: LayoutProps;
  phone: LayoutProps;
};

export type GuiViewLayoutMode = keyof GuiViewLayout;
