import { WnObj } from '../..';
import { computed, ref } from 'vue';
import _ from 'lodash';
import { getLogger } from '@site0/tijs';
import { Walnut } from 'src/core/wn-server';
import { DirGUIView } from './dir.type';

const log = getLogger('wn.store.dir.setup');

export function useDirSetup() {
  log.debug('useDirSetup');
  let oHome = ref<WnObj>();
  let oHomeIndex = ref<WnObj>();
  let homeId = computed(() => _.get(oHome.value, 'id'));
  let homeIndexId = computed(() => _.get(oHomeIndex.value, 'id'));
  let isHomeExists = computed(() => (homeId.value ? true : false));

  // GUI 的加载路径
  let actionsPath = ref<string>();
  let layoutPath = ref<string>();
  let schemaPath = ref<string>();
  let methodPaths = ref<string>();

  async function __update_by_view(view: Partial<DirGUIView>) {
    if (view.indexPath) {
      oHomeIndex.value = await Walnut.fetchObj(view.indexPath);
    }
    actionsPath.value = view.actionsPath;
    layoutPath.value = view.layoutPath;
    schemaPath.value = view.schemaPath;
    methodPaths.value = view.methodPaths;
  }

  function resetGUISettings() {}

  async function loadGUISettings(obj?: WnObj) {
    oHome.value = obj;

    // Guard: oHome is Nil
    if (_.isNil(oHome.value)) {
      oHomeIndex.value = undefined;
      resetGUISettings();
      return;
    }
    // oHome is GUI View
    if ('FILE' == oHome.value['race']) {
      // File as View
      if ('gui-view' == oHome.value['tp']) {
        let json = await Walnut.loadJson(`id:${oHome.value.id}`);
        let view = json as Partial<DirGUIView>;
        await __update_by_view(view);
      }
      // oHome is FILE
      else {
        // TODO
      }
    }
    // oHome is Thing Set
    // oHome is DIR
    if ('DIR' == oHome.value.race) {
      oHomeIndex.value = oHome.value;
      // 指定了视图
      let viewPath = oHome.value['gui-view'];
      if (viewPath && _.isString(viewPath)) {
        let json = await Walnut.loadJson(viewPath);
        let view = json as Partial<DirGUIView>;
        await __update_by_view(view);
      }
      // 自己的元数据就是视图内容
      else {
        actionsPath.value = oHome.value['actionsPath'];
        layoutPath.value = oHome.value['layoutPath'];
        schemaPath.value = oHome.value['schemaPath'];
        methodPaths.value = oHome.value['methodPaths'];
      }
    }
  }

  return {
    oHome,
    oHomeIndex,
    homeId,
    homeIndexId,
    isHomeExists,
    loadGUISettings,
  };
}
