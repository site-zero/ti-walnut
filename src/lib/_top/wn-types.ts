import { I18nLang, SideBarItem, Vars } from '@site0/tijs';

export type AjaxResult<T = any> = {
  ok: boolean;
  errCode?: string;
  msg?: string;
  data?: T;
};

export type WnObj = Record<string, any>;

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
}

export type WnDictSetup = {
  /**
   * 动态字典，那么，会认为 data 为一个命令模板，上下文就是 Vars
   */
  dynamic?: boolean;
  /**
   * 动态字典命令模板执行的时候标准输入，需要 explain, 上下文就是 Vars
   */
  input?:any;

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
