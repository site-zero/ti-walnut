export type AjaxResult = {
  ok: boolean;
  errCode?: string;
  msg?: string;
  data?: any;
};

export function isAjaxResult(re: any): re is AjaxResult {
  if (re && 'boolean' === typeof re.ok) {
    return true;
  }
  return false;
}

export type WnObj = Record<string, any>;

export function isWnObj(obj: any): obj is WnObj {
  return (
    obj &&
    typeof obj === 'object' &&
    'string' === typeof obj.id &&
    'string' === typeof obj.pid &&
    /^(DIR|FILE)$/.test(obj.race) &&
    'string' === typeof obj.nm
  );
}

export type WnObjContentFinger = {
  id: string;
  len: number;
  sha1: string;
  mime: string;
  tp: string;
};

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
