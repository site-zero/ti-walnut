import { I18nLang, Vars } from '@site0/tijs';

export type AjaxResult = {
  ok: boolean;
  errCode: string;
  msg: string;
  data: any;
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

export type UserSession = {
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
