import {
  Convertor,
  DictSetup,
  Dicts,
  DynDictMaker,
  IDict,
  IconInput,
  LoadData,
  LoadDictItem,
  QueryDictItems,
  TiDict,
  Tmpl,
  Util,
  ValGetter,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { WnDictSetup } from '../lib';
import { Walnut } from './wn-server';

const debug = false;

function makeWalnutDictGetData(
  data?: string | Vars[],
  input?: any
): LoadData<any> {
  if (data) {
    // 命令或者加载静态资源
    if (_.isString(data)) {
      // 加载静态资源
      if (data.startsWith('load://')) {
        return (signal?: AbortSignal): Promise<any[]> => {
          return Walnut.loadJson(data, { signal });
        };
      }

      // 命令
      return (signal?: AbortSignal): Promise<any[]> => {
        return Walnut.exec(data, { as: 'json', input, signal });
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
  query?: string,
  execInput?: any
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
    return Walnut.exec(cmdText, { as: 'json', input: execInput, signal });
  };
}

function makeWalnutDictGetItem(
  query?: string,
  execInput?: any
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
    return Walnut.exec(cmdText, { as: 'json', input: execInput, signal });
  };
}

function makeWalnutDictOptions(setup: WnDictSetup, input?: string): DictSetup {
  // 获取字典项目的图标，的方法，支持了 select Arm
  let get_icon: string | ValGetter<any, IconInput | undefined> | undefined =
    undefined;
  // 直接指定字典项图标键
  if (_.isString(setup.icon)) {
    get_icon = setup.icon;
  }
  // 根据配置的 Select Arms 来动态获取图标
  else if (_.isArray(setup.icon)) {
    get_icon = Util.buildSelectArms(setup.icon);
  }
  return {
    data: makeWalnutDictGetData(setup.data, input),
    query: makeWalnutDictQueryItems(setup.query, input),
    item: makeWalnutDictGetItem(setup.item, input),
    value: setup.value,
    text: setup.text,
    icon: get_icon,
    tip: setup.tip,
  };
}

function __prepare_dyn_dict_query_cmd(
  _query?: string
): Convertor<Vars, string | undefined> {
  if (!_query) {
    return (_vars: Vars): string | undefined => undefined;
  }
  let tmpl = Tmpl.parse(_query);
  return (_vars: Vars): string | undefined => {
    return tmpl.render(_vars);
  };
}

function __prepare_dyn_dict_input(
  input?: any
): Convertor<Vars, string | undefined> {
  if (!input) {
    return (_vars: Vars): string | undefined => undefined;
  }
  let exp = Util.buildExplainer(input);
  return (_vars: Vars): string | undefined => {
    let re = exp.explain(_vars, {
      evalFunc: true,
    });
    if (_.isNil(re)) {
      return;
    }
    if (!_.isString(re)) {
      return JSON.stringify(re);
    }
    return re;
  };
}

function makeWalnutDynamicDictCreator(
  setup: WnDictSetup
): DynDictMaker<any, any> {
  // 编制
  let _get_data = __prepare_dyn_dict_query_cmd(setup.data as string);
  let _get_query = __prepare_dyn_dict_query_cmd(setup.query as string);
  let _get_item = __prepare_dyn_dict_query_cmd(setup.item as string);
  let _get_input = __prepare_dyn_dict_input(setup.input);
  let value = setup.value;
  let text = setup.text;
  let icon = setup.icon;
  let tip = setup.tip;

  return (vars: Vars): TiDict => {
    let data = _get_data(vars);
    let query = _get_query(vars);
    let item = _get_item(vars);
    let input = _get_input(vars);

    let setup = makeWalnutDictOptions(
      {
        data,
        query,
        item,
        value,
        text,
        icon,
        tip,
      },
      input
    );
    let options = Dicts.makeDictOptions(setup);
    return Dicts.getOrCreate(options);
  };
}

export function installWalnutDicts(dicts?: Record<string, WnDictSetup>) {
  if (!dicts) {
    return;
  }
  if (debug) console.log('installWalnutDicts', dicts);
  for (let dictName of _.keys(dicts)) {
    let _setup = dicts[dictName];
    // 动态字典
    if (_setup.dynamic) {
      let creator = makeWalnutDynamicDictCreator(_setup);
      Dicts.createDynamicDict(creator, dictName);
    }
    // 静态字典
    else {
      let setup = makeWalnutDictOptions(_setup);
      let options = Dicts.makeDictOptions(setup);
      Dicts.getOrCreate(options, dictName);
    }
  }
}
