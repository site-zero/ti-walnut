import _ from "lodash";

export type AjaxResult = {
  ok: boolean;
  errCode: string;
  msg: string;
  data: any;
};

export interface ServerConfig {
  protocal: "http" | "https";
  host: string;
  port: number;
}

export type UserSession = {
  ticket?: string;
  me?: UserInfo;
};

export type UserInfo = {
  loginName: string;
  mainGroup: string;
  role: string;
  loginAt: Date;
  homePath: string;
  theme: string;
  lang: string;
};
