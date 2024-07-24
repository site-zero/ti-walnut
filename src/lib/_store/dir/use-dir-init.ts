import { getLogger, Util } from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import { WnObj } from '../..';
import { Walnut } from '../../../core';
import {
  DirGUIViewBehaviors,
  DirGUIViewInfo,
  DirInitFeature,
  DirInitGetters,
  DirInitSettings,
} from './dir.type';

const log = getLogger('wn.store.dir.init');

export function useDirInit(): DirInitFeature {
  log.debug('useDirSetup');
  let _init: DirInitSettings = {
    moduleName: ref<string>(''),
    oHome: ref<WnObj>(),
    oHomeIndex: ref<WnObj | undefined>(),
    actionPath: ref<string>(),
    layoutPath: ref<string>(),
    schemaPath: ref<string>(),
    methodPaths: ref<string[]>([]),
    behaviors: ref<DirGUIViewBehaviors>({}),
  };

  let _getters: DirInitGetters = {
    homeId: computed(() => _.get(_init.oHome.value, 'id')),
    homeIndexId: computed(() => _.get(_init.oHomeIndex.value, 'id')),
    isHomeExists: computed(() =>
      _init.oHome.value && _init.oHome.value.id ? true : false
    ),
    isThingSet: computed(() =>
      _init.oHome.value &&
      _init.oHome.value.race == 'DIR' &&
      _init.oHome.value.tp == 'thing_set'
        ? true
        : false
    ),
  };

  function _cook_path(oHome: WnObj, path?: string) {
    if (path && !/^[~/]/.test(path)) {
      let pid = 'DIR' == oHome.race ? oHome.id : oHome.pid;
      return Util.appendPath(`id:${pid}`, path);
    }
    return path;
  }

  async function __update_by_view(oHome: WnObj, view: DirGUIViewInfo) {
    if (view.indexPath) {
      let _path = _cook_path(oHome, view.indexPath);
      _init.oHomeIndex.value = await Walnut.fetchObj(_path!);
    } else if ('DIR' == oHome.race) {
      _init.oHomeIndex.value = oHome;
    } else {
      _init.oHomeIndex.value = await Walnut.getObj(oHome.pid);
    }
    _init.actionPath.value = _cook_path(oHome, view.actionPath);
    _init.layoutPath.value = _cook_path(oHome, view.layoutPath);
    _init.schemaPath.value = _cook_path(oHome, view.schemaPath);
    if (view.methodPaths && !_.isEmpty(view.methodPaths)) {
      let _method_paths = [] as string[];
      for (let methodPath of view.methodPaths) {
        if (methodPath) {
          _method_paths.push(_cook_path(oHome, methodPath)!);
        }
      }
      _init.methodPaths.value = _method_paths;
    } else {
      _init.methodPaths.value = undefined;
    }
    _init.behaviors.value = view.behaviors || {};
  }

  async function _init_dir(obj: WnObj) {
    // oHome is GUI View
    if ('FILE' == obj.race) {
      // File as View
      if ('gui-view' == obj.tp) {
        let objId = obj.id;
        let json = await Walnut.loadJson(`id:${objId}`);
        let view = json as DirGUIViewInfo;
        await __update_by_view(obj, view);
        _init.oHome.value = _init.oHomeIndex.value;
      }
      // oHome is FILE
      else {
        obj = await Walnut.fetchObj(`id:${obj.pid}`);
      }
    }
    // oHome is Thing Set
    // oHome is DIR
    if ('DIR' == obj.race) {
      _init.oHome.value = obj;
      let isThingSet = 'thing_set' == obj.tp;
      // 指定了视图
      // 如果是 ThingSet 则默认视图为 `./thing-view.json5`
      let viewPath = obj['gui-view'];
      if (!viewPath && isThingSet) {
        viewPath = 'thing-view.json5';
      }
      if (viewPath && _.isString(viewPath)) {
        log.debug('viewPath=', viewPath);
        // 确保是绝对路径
        if (!/^[~/]/.test(viewPath)) {
          viewPath = Util.appendPath(`id:${obj.id}`, viewPath);
        }
        // 加载视图
        let json = await Walnut.loadJson(viewPath);
        let view = json as DirGUIViewInfo;
        // 对于 thingSet 索引路径一定要设置好
        if (isThingSet) {
          view.indexPath = 'index';
        }
        await __update_by_view(_init.oHome.value, view);
      }
      // 自己的元数据就是视图内容
      else {
        let view = {} as DirGUIViewInfo;
        view.actionPath = obj['actions-path'];
        view.layoutPath = obj['layout-path'];
        view.schemaPath = obj['schema-path'];
        view.methodPaths = obj['method-paths'];
        view.behaviors = obj['behaviors'];
        await __update_by_view(_init.oHome.value, view);
      }
    }
    // 不可能，防守一下
    else {
      throw `obj must be DIR: ${JSON.stringify(obj)}`;
    }
  }

  function _reset_dir_settings() {
    _init.moduleName.value = '';
    _init.oHome.value = undefined;
    _init.oHomeIndex.value = undefined;
    _init.actionPath.value = undefined;
    _init.layoutPath.value = undefined;
    _init.schemaPath.value = undefined;
    _init.methodPaths.value = undefined;
  }

  return {
    ..._init,
    ..._getters,
    initDirSettings: async (obj?: WnObj) => {
      // Guard: oHome is Nil
      if (_.isNil(obj)) {
        _reset_dir_settings();
        return;
      }
      // Init dir Setting
      await _init_dir(obj);
    },
  };
}
