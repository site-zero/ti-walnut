import {
  ActionBarItem,
  FuncA1,
  Match,
  TiMatch,
  Vars,
  getLogger,
} from '@site0/tijs';
import _ from 'lodash';
import JSON5 from 'json5';
import { WnObj } from 'src/lib';

export interface AppGUI {
  // 当前视图的动作项
  actions?: ActionBarItem[];
  // 当前视图的显示控件
  comType: string;
  comConf: Vars;
}

export function isAppGUI(obj: any): obj is AppGUI {
  return obj && _.isString(obj.comType) && _.isPlainObject(obj.comConf);
}

export type AppGUIRule = {
  name: string;
  test?: TiMatch;
  view: AppGUI;
};

export type GUIDispatcher = FuncA1<Record<string, any> | string, AppGUI>;

export function findGUI(input: Record<string, any> | string): AppGUI {
  return findGUIofRules(input, VIEW_RULES);
}

const VIEW_RULES = [] as AppGUIRule[];

const log = getLogger('wn.core.gui');

export function addGUIRule(name: string, view: AppGUI, test?: any) {
  if (name && view) {
    log.debug('addGUIRule', name, view, test);
    VIEW_RULES.push({
      name,
      view,
      test: Match.parse(test, true),
    });
  }
}

export function findGUIofRules(
  input: WnObj | string,
  rules: AppGUIRule[]
): AppGUI {
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

export function installAllDefaultGUIs() {
  // ----------------- DIR ---------------------
  addGUIRule(
    'view-dir',
    {
      comType: 'WnDirBrowser',
      comConf: {
        value: '=..',
      },
    },
    {
      race: 'DIR',
    }
  );
  // ----------------- any ---------------------
  addGUIRule('view-any', {
    comType: 'WnObjViewer',
    comConf: {
      value: '=..',
    },
  });
  // ----------------- END -----------------
}
