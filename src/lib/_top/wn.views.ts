import { ActionBarItem, FuncA1, TiMatch, Vars } from '@site0/tijs';
import _ from 'lodash';
import JSON5 from 'json5';
import { _add_all_dft_views } from './wn.view.defaults';

export interface AppView {
  // 当前视图的动作项
  actions?: ActionBarItem[];
  // 当前视图的显示控件
  comType: string;
  comConf: Vars;
}

export function isAppView(obj: any): obj is AppView {
  return obj && _.isString(obj.comType) && _.isPlainObject(obj.comConf);
}

export type AppViewRule = {
  name: string;
  test?: TiMatch;
  view: AppView;
};

export type ViewDispatcher = FuncA1<Record<string, any> | string, AppView>;

export function findWalnutView(input: Record<string, any> | string): AppView {
  return findViewInRules(input, VIEW_RULES);
}

const VIEW_RULES = [] as AppViewRule[];

export function addViewRule(name: string, view: AppView, test?: any) {
  if (name && view) {
    VIEW_RULES.push({
      name,
      view,
      test,
    });
  }
}

// 添加所有的内置默认视图
_add_all_dft_views();

export function findViewInRules(
  input: Record<string, any> | string,
  rules: AppViewRule[]
): AppView {
  let viewName = _.isString(input) ? input : '';

  // find by viewName
  if (viewName) {
    for (let rule of rules) {
      if (viewName == rule.name) {
        return _.cloneDeep(rule.view);
      }
    }
  }
  // find by match
  else {
    for (let rule of rules) {
      if (!rule.test || rule.test.test(input)) {
        return _.cloneDeep(rule.view);
      }
    }
  }

  throw `Fail to found view by '${JSON5.stringify(input)}'`;
}
