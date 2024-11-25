import { I18nLang, SideBarItem, Vars } from '@site0/tijs';
import _ from 'lodash';

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

export type WnObjInfo = {
  id?: string;
  ph?: string;
};

export interface ServerConfig {
  protocal: 'http' | 'https';
  host: string;
  port: number;
  domain?: string;
  site?: string;
  lang?: I18nLang;
  sidebar?: boolean | string;
  logLevel?: string;
  logger?: Record<string, string>;
  dicts?: string | Record<string, WnDictSetup>;
  /**
   * 可以给扩展(譬如 WnHub)使用， 一个 objKind 具体
   * 可以对应到哪个对象的映射
   */
  objPath?: Record<string, string>;
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
  icon?: string;
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

export type FetchObjOptions = {
  loadAxis?: boolean;
  loadPath?: boolean;
  signal?: AbortSignal;
};

export type UserSidebar = {
  statusStoreKey?: string;
  sidebar: SideBarItem[];
};

export type StoreStatus = {
  loading: boolean;
  saving: boolean;
  removing: boolean;
  processing: boolean;
  changed: boolean;
};

export type WnMetaSaving = {
  update: (meta: Vars) => Promise<Vars | undefined>;
  create: (meta: Vars) => Promise<Vars | undefined>;
};
