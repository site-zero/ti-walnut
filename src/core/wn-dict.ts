import {
  DictSetup,
  Dicts,
  IDict,
  LoadData,
  LoadDictItem,
  QueryDictItems,
  Tmpl,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { WnDictSetup } from '../lib';
import { Walnut } from './wn-server';

function makeWalnutDictGetData(data?: string | Vars[]): LoadData<any> {
  if (data) {
    // 命令或者加载静态资源
    if (_.isString(data)) {
      // 加载静态资源
      if (data.startsWith('load://')) {
        return (signal?: AbortSignal): Promise<any[]> => {
          return Walnut.loadJson(data, signal);
        };
      }

      // 命令
      return (signal?: AbortSignal): Promise<any[]> => {
        return Walnut.exec(data, { as: 'json', signal });
      };
    }
    // 静态数组
    if (_.isArray(data)) {
      return (_signal?: AbortSignal): Promise<any[]> =>
        new Promise<any[]>((resolve) => {
          resolve(data as any[]);
        });
    }
  }
  // 默认就是空
  return (_signal?: AbortSignal): Promise<any[]> =>
    new Promise<any[]>((resolve) => {
      resolve([]);
    });
}

function makeWalnutDictQueryItems(
  query?: string
): undefined | QueryDictItems<any, any, any> {
  // 默认就是空，字典构造函数  makeDictOptions 会自动填充这个选项
  if (!query) {
    return;
  }
  // 命令
  let cmdTmpl = Tmpl.parse(query);
  return (
    _dict: IDict<any, any>,
    input: any,
    signal?: AbortSignal
  ): Promise<any[]> => {
    let vars: Vars;
    if (_.isObject(input)) {
      vars = input as Vars;
    } else {
      vars = { val: input };
    }
    let cmdText = cmdTmpl.render(vars);
    return Walnut.exec(cmdText, { as: 'json', signal });
  };
}

function makeWalnutDictGetItem(
  query?: string
): undefined | LoadDictItem<any, any> {
  // 默认就是空，字典构造函数  makeDictOptions 会自动填充这个选项
  if (!query) {
    return;
  }
  // 命令
  let cmdTmpl = Tmpl.parse(query);
  return (
    _dict: IDict<any, any>,
    input: any,
    signal?: AbortSignal
  ): Promise<any> => {
    let vars: Vars;
    if (_.isObject(input)) {
      vars = input as Vars;
    } else {
      vars = { val: input };
    }
    let cmdText = cmdTmpl.render(vars);
    return Walnut.exec(cmdText, { as: 'json', signal });
  };
}

export function makeWalnutDictOptions(setup: WnDictSetup): DictSetup {
  return {
    data: makeWalnutDictGetData(setup.data),
    query: makeWalnutDictQueryItems(setup.query),
    item: makeWalnutDictGetItem(setup.item),
    value: setup.value,
    text: setup.text,
    icon: setup.icon,
    tip: setup.tip,
  };
}

export function installWalnutDicts(dicts?: Record<string, WnDictSetup>) {
  if (!dicts) {
    return;
  }
  console.log('installWalnutDicts', dicts);
  for (let dictName of _.keys(dicts)) {
    let setup = makeWalnutDictOptions(dicts[dictName]);
    let options = Dicts.makeDictOptions(setup);
    Dicts.getOrCreate(options, dictName);
  }
}
