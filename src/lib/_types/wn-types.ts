import {
  I18nLang,
  LayoutProps,
  SelectValueArm,
  SideBarItem,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { HubViewOptions } from '../_store';

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
    typeof obj === 'object' &&
    _.isString(obj.id) &&
    _.isString(obj.pid) &&
    /^(DIR|FILE)$/.test(obj.race) &&
    _.isString(obj.nm)
  );
}

export type WnRace = 'DIR' | 'FILE';

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
  id?: string;
  ph?: string;
};

type ServerUISetup = {
  useStdFields?: boolean;
  useStdColumns?: boolean;
  fields?: string | string[];
  columns?: string | string[];
};

export interface ServerConfig {
  logo?: string;
  title?: string;
  version?: string;
  protocal: 'http' | 'https';
  host: string;
  port: number;
  domain?: string;
  site?: string;
  lang?: I18nLang;
  ui?: ServerUISetup;
  sidebar?: boolean | string;
  logLevel?: string;
  logger?: Record<string, string>;
  dicts?: string | Record<string, WnDictSetup>;

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
  objPath?: Record<string, SelectValueArm<string, Vars>>;

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
}

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
  as?: 'json' | 'text';
  signal?: AbortSignal;
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
  cache?: boolean|Map<string, any>;
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
