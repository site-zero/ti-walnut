import { I18nLang, SideBarItem } from '@site0/tijs';

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
  site?: string;
  lang?: I18nLang;
  sidebar?: boolean | string;
  logLevel?: string;
  logger?: Record<string, string>;
}

export interface SignInForm {
  username?: string;
  password?: string;
}

export type WnExecOptions = {
  input?: string;
  as?: 'json' | 'text';
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
