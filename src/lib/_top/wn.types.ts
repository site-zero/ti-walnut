import { FuncA1, I18nLang, SideBarItem, TiMatch, Vars } from '@site0/tijs';
import _ from 'lodash';

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
}

export interface SignInForm {
  username?: string;
  password?: string;
}

export type UserSessionState = {
  ticket?: string;
  me?: UserInfo;
  env: Vars;
  loginAt?: Date;
  expireAt?: Date;
  homePath?: string;
  theme?: string;
  lang?: string;
  errCode?: string;
  sidebar?: UserSidebar;
};

export type UserSessionApi = UserSessionState & {
  hasTicket: boolean;
};

export type WnRole = 'MEMBER' | 'ADMIN' | 'GUEST';

export type UserInfo = {
  loginName: string;
  mainGroup: string;
  role?: string[];
  nickname?: string;
  jobs?: string[];
  depts?: string[];
  roleInOp?: WnRole;
  roleInDomain?: WnRole;
  avatar?: string;
};

export type GlobalStatus = {
  loading: boolean | string;
  saving: boolean | string;
  removing: boolean | string;
  processing: boolean | string;
  changed: boolean;
};

export type GlobalSettings = {
  exposeHidden: boolean
};

export type WnExecOptions = {
  input?: string;
  as?: 'json' | 'text';
};

export type UserSidebar = {
  statusStoreKey?: string;
  sidebar: SideBarItem[];
};
