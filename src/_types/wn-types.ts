import _ from "lodash";

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
    /^(DIR|FILE)$/.test(obj.race) &&
    _.isString(obj.nm)
  );
}

export function toWnObj(obj: any): WnObj {
  if (!isWnObj(obj)) {
    throw "Not WnObj: " + JSON.stringify(obj);
  }
  return obj;
}

export function toWnObjs(objs: any[]): WnObj[] {
  let re = [] as WnObj[];
  for (let o of objs) {
    re.push(toWnObj(o));
  }
  return re;
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

export type WnUploadNameContext = {
  nowInSec: string;
  nowInMin: string;
  today: string;
  timeInSec: string;
  timeInMin: string;
  loginName: string;
  nickname: string;
};

export type WnUploadFileNameRender = (ctx: WnUploadNameContext) => string;
