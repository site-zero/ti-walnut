import { Util, getLogger } from '@site0/tijs';
import { ComputedRef, Ref, computed, ref } from 'vue';
import { WnObj, WnObjInfo } from '..';
import { AppGUI, Walnut, findGUI } from '../../core';
import _ from 'lodash';

const log = getLogger('wn.store.meta-gui');

let _defaultGUI = {
  comType: 'TiRoadblock',
  comConf: {
    icon: 'zmdi-traffic',
    text: 'NO GUI',
  },
} as AppGUI;

export type MetaGUIFeature = {
  meta: Ref<WnObj | undefined>;
  setDefaultGUI: (gui: AppGUI) => void;
  hasMeta: ComputedRef<boolean>;
  GUIView: ComputedRef<AppGUI>;
  reset: () => void;
  reload: (info: WnObjInfo) => Promise<void>;
};

export function useMetaGUIStore(): MetaGUIFeature {
  //---------------------------------------------
  // 数据模型
  //---------------------------------------------
  const _meta = ref<WnObj>();

  //---------------------------------------------
  // 计算属性
  //---------------------------------------------
  let hasMeta = computed(() => (_meta.value && _meta.value.id ? true : false));
  let GUIView = computed(() => {
    //console.warn('Rebuild GUIView', _.get(_meta.value, 'id'));
    if (!hasMeta.value) {
      return _.cloneDeep(_defaultGUI);
    }

    // Explain a new GUI by current meta
    let gui = findGUI(_meta.value!);
    let ctx = _.cloneDeep(_meta.value!);
    let real = Util.explainObj(ctx, gui);
    log.debug('GUIView', real);
    return real;
  });

  //---------------------------------------------
  // 输出特性
  //---------------------------------------------
  return {
    meta: _meta,
    hasMeta,
    setDefaultGUI: (gui: AppGUI) => {
      _defaultGUI = gui;
    },
    GUIView,
    reset: () => {
      _meta.value = undefined;
    },
    reload: async (info: WnObjInfo = {}) => {
      log.debug('reload', info);
      let { id, ph } = info;
      // 获取重新加载对象的路径:
      let objPath;
      // 直接指定了对象的 ID
      if (id) {
        objPath = `id:${id}`;
      }
      // 指定了对象全路径
      else if (ph) {
        objPath = ph;
      }
      // 直接指定了对象
      else if (hasMeta.value) {
        let meta = _meta.value!;
        if (meta.ph) {
          objPath = meta.ph;
        } else {
          objPath = `id:${meta.id}`;
        }
      }
      // 防守
      if (!objPath) {
        throw '!meta.reload: without id or path!';
      }
      // 重新加载
      try {
        let obj = await Walnut.fetchObj(objPath, {
          loadAxis: true,
          loadPath: true,
        });
        _meta.value = _.cloneDeep(obj);
        log.debug('fetchObj=>', _meta.value);
      } catch (err) {
        console.error(err);
      }
    },
  } as MetaGUIFeature;
}
