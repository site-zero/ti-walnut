import { WnObj } from '../..';
import { computed, ref } from 'vue';
import _ from 'lodash';
import { getLogger } from '@site0/tijs';
import { Walnut } from 'src/core/wn-server';
import { DirGUIViewInfo, DirBaseSettings, DirBaseFeatures } from './dir.type';

const log = getLogger('wn.store.dir.setup');

export function useDirSetup(): DirBaseFeatures {
  log.debug('useDirSetup');
  let S: DirBaseSettings = {
    moduleName: ref(''),
    oHome: ref<WnObj>(),
    oHomeIndex: ref<WnObj | undefined>(),
    actionsPath: ref<string>(),
    layoutPath: ref<string>(),
    schemaPath: ref<string>(),
    methodPaths: ref<string>(),
  };

  async function __update_by_view(view: Partial<DirGUIViewInfo>) {
    if (view.indexPath) {
      S.oHomeIndex.value = await Walnut.fetchObj(view.indexPath);
    } else {
      S.oHomeIndex.value = undefined;
    }
    S.actionsPath.value = view.actionsPath;
    S.layoutPath.value = view.layoutPath;
    S.schemaPath.value = view.schemaPath;
    S.methodPaths.value = view.methodPaths;
  }

  async function _init_dir(obj: WnObj) {
    // oHome is GUI View
    if ('FILE' == obj.race) {
      // File as View
      if ('gui-view' == obj.tp) {
        let objId = obj.id;
        let json = await Walnut.loadJson(`id:${objId}`);
        let view = json as Partial<DirGUIViewInfo>;
        await __update_by_view(view);
        S.oHome.value = S.oHomeIndex.value;
      }
      // oHome is FILE
      else {
        // TODO
      }
    }
    // oHome is Thing Set
    // oHome is DIR
    if ('DIR' == obj.race) {
      S.oHome.value = obj;
      // 指定了视图
      let viewPath = obj['gui-view'];
      if (viewPath && _.isString(viewPath)) {
        let json = await Walnut.loadJson(viewPath);
        let view = json as Partial<DirGUIViewInfo>;
        await __update_by_view(view);
        S.oHomeIndex.value = S.oHomeIndex.value || obj;
      }
      // 自己的元数据就是视图内容
      else {
        S.oHomeIndex.value = obj;
        S.actionsPath.value = obj['actions-path'];
        S.layoutPath.value = obj['layout-path'];
        S.schemaPath.value = obj['schema-path'];
        S.methodPaths.value = obj['method-paths'];
      }
    }
  }

  function _reset_dir_settings() {
    S.moduleName.value = '';
    S.oHome.value = undefined;
    S.oHomeIndex.value = undefined;
    S.actionsPath.value = undefined;
    S.layoutPath.value = undefined;
    S.schemaPath.value = undefined;
    S.methodPaths.value = undefined;
  }

  async function loadDirSettings(obj?: WnObj) {
    // Guard: oHome is Nil
    if (_.isNil(obj)) {
      _reset_dir_settings();
      return;
    }
    // Init dir Setting
    _init_dir(obj);
  }

  return {
    ...S,
    homeId: computed(() => _.get(S.oHome.value, 'id')),
    homeIndexId: computed(() => _.get(S.oHomeIndex.value, 'id')),
    isHomeExists: computed(() =>
      S.oHome.value && S.oHome.value.id ? true : false
    ),
    loadDirSettings,
  };
}
