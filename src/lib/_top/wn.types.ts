import { I18nLang, IconInput, Vars } from '@site0/tijs';

export type AjaxResult = {
  ok: boolean;
  errCode?: string;
  msg?: string;
  data?: any;
};

export interface ServerConfig {
  protocal: 'http' | 'https';
  host: string;
  port: number;
  site?: string;
  lang?: I18nLang;
}

export interface SignInForm {
  username?: string;
  password?: string;
}

export type UserSessionState = {
  ticket?: string;
  me?: UserInfo;
  env: Vars;
  loginAt: Date;
  expireAt: Date;
  homePath: string;
  theme: string;
  lang: string;
  errCode?: string;
};

export type UserSessionApi =  UserSessionState & {
  hasTicket:boolean
}

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

export type WnExecOptions = {
  input?: string;
  as?: 'json' | 'text';
};

export type SideBarItem = {
  key?: string;
  path?: string;
  icon?: IconInput;
  title?: string;
  items?: SideBarItem[];
};

export type SideBarItemType = 'group' | 'item';

export type SideBarDisplayItem = Omit<SideBarItem, 'key' | 'items'> & {
  uniqKey: string;
  type: SideBarItemType;
  items?: SideBarDisplayItem[];
};
