import { getLogger } from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import { WnObj } from '../..';
import { Walnut } from '../../../core';
import {
  DirGUIViewBehaviors,
  DirGUIViewInfo,
  DirInitFeatures,
  DirInitGetters,
  DirInitSettings,
} from './dir.type';

const log = getLogger('wn.pinia.dir.init');

export function useDirInit(): DirInitFeatures {
  log.debug('useDirSetup');
  let _init: DirInitSettings = {
    moduleName: ref<string>(''),
    oHome: ref<WnObj>(),
    oHomeIndex: ref<WnObj | undefined>(),
    actionsPath: ref<string>(),
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
  };

  async function __update_by_view(view: DirGUIViewInfo) {
    if (view.indexPath) {
      _init.oHomeIndex.value = await Walnut.fetchObj(view.indexPath);
    } else {
      _init.oHomeIndex.value = undefined;
    }
    _init.actionsPath.value = view.actionsPath;
    _init.layoutPath.value = view.layoutPath;
    _init.schemaPath.value = view.schemaPath;
    if (view.methodPaths && !_.isEmpty(view.methodPaths)) {
      _init.methodPaths.value = _.concat(view.methodPaths);
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
        await __update_by_view(view);
        _init.oHome.value = _init.oHomeIndex.value;
      }
      // oHome is FILE
      else {
        // TODO
      }
    }
    // oHome is Thing Set
    // oHome is DIR
    if ('DIR' == obj.race) {
      _init.oHome.value = obj;
      // 指定了视图
      let viewPath = obj['gui-view'];
      if (viewPath && _.isString(viewPath)) {
        log.debug('viewPath=', viewPath);
        let json = await Walnut.loadJson(viewPath);
        let view = json as DirGUIViewInfo;
        await __update_by_view(view);
        if (!_init.oHomeIndex.value) {
          _init.oHomeIndex.value = obj;
        }
      }
      // 自己的元数据就是视图内容
      else {
        let view = {} as DirGUIViewInfo;
        view.actionsPath = obj['actions-path'];
        view.layoutPath = obj['layout-path'];
        view.schemaPath = obj['schema-path'];
        view.methodPaths = obj['method-paths'];
        await __update_by_view(view);
        if (!_init.oHomeIndex.value) {
          _init.oHomeIndex.value = obj;
        }
      }
    }
  }

  function _reset_dir_settings() {
    _init.moduleName.value = '';
    _init.oHome.value = undefined;
    _init.oHomeIndex.value = undefined;
    _init.actionsPath.value = undefined;
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
