import { Util } from '@site0/tijs';
import _ from 'lodash';
import { useWnObj, Walnut } from '../..';
import { HubViewOptions } from '../lib/_store';
import { WnObj } from '../lib/_types';

function __update_view_tmpl(viewTmpl: HubViewOptions, json: any) {
  let modelOptions = viewTmpl.modelOptions ?? {};
  if (json.modelOptions) {
    _.assign(modelOptions, json.modelOptions);
  }
  _.assign(viewTmpl, json);
  viewTmpl.modelOptions = modelOptions;
}

export async function createObjViewOptions(
  obj: WnObj
): Promise<HubViewOptions> {
  let viewTmpl: HubViewOptions;
  // 文件对象的话,两种可能性
  // 1. 本身就是视图文件
  // 2. 普通文件对象
  if ('FILE' == obj.race) {
    viewTmpl = {
      viewName: 'auto-STD-META',
      model: 'STD-META',
      modelOptions: {
        objPath: '->id:${obj.id}',
      },
    };
    // File as View
    if ('gui-view' == obj.tp) {
      let objId = obj.id;
      let json = await Walnut.loadJson(`id:${objId}`);
      __update_view_tmpl(viewTmpl, json);
    }
  }
  // 3. 数据集目录
  else if ('thing_set' == obj.tp) {
    viewTmpl = {
      viewName: 'auto-TH-STD-LIST',
      model: 'STD-LIST',
      modelOptions: {
        homePath: '->id:${obj.id}',
        indexPath: 'index',
        dataPath: 'data',
      },
    };
    let _objs = useWnObj(`id:${obj.id}`);
    // 看看内部是否有 `./thing-view.json`
    let thView = await _objs.getChild('thing-view.json5');
    if (thView) {
      let json = await Walnut.loadJson(`id:${thView.id}`);
      __update_view_tmpl(viewTmpl, json);
    }
  }
  // 4. 普通目录
  else {
    viewTmpl = {
      viewName: 'auto-STD-LIST',
      model: 'STD-LIST',
      modelOptions: {
        homePath: '->id:${obj.id}',
      },
    };
    // 指定了 viewPath
    if (obj.gui_view) {
      let json = await Walnut.loadJson(obj.gui_view);
      __update_view_tmpl(viewTmpl, json);
    }
  }

  // 最后输出视图配置
  return viewTmpl;
}

export function anyToHubViewOptions(input: any): HubViewOptions {
  if (_.isEmpty(input)) {
    return { viewName: 'AnyView', model: 'EMPTY' };
  }
  // 逐个设置键
  let re: HubViewOptions = {
    viewName: input.viewName ?? 'AnyView',
    model: input.model ?? 'EMPTY',
    modelOptions: input.modelOptions ?? {},
  };

  const _to_value = (val: any) => {
    if (_.isString(val)) {
      return val;
    }
    if (_.isFunction(val)) {
      return val;
    }
    if (_.isPlainObject(val)) {
      return () => Util.jsonClone(val);
    }
  };

  re.actions = _to_value(input.actions);
  re.layout = _to_value(input.layout);
  re.schema = _to_value(input.schema);

  if (input.methods) {
    if (_.isString(input.methods)) {
      re.methods = [input.methods];
    } else if (_.isArray(input.methods)) {
      re.methods = input.methods;
    }
  }

  // 搞定了
  return re;
}
