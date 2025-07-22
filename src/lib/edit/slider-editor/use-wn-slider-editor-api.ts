import {
  Alg,
  ListSelectEmitInfo,
  MoveDirection,
  SelectableState,
  Tmpl,
  useKeep,
  useSelectable,
  Util,
  Vars,
} from '@site0/tijs';
import JSON5 from 'json5';
import _ from 'lodash';
import { computed, reactive } from 'vue';
import { WnObj } from '../../../_types';
import { Walnut } from '../../../core';
import {
  WnSlider,
  WnSliderEditorProps,
  WnSliderEmitter,
} from './wn-slider-editor-types';

export type WnSliderEditorApi = ReturnType<typeof useWnSliderEditorApi>;

export function useWnSliderEditorApi(
  props: WnSliderEditorProps,
  emit: WnSliderEmitter
) {
  console.log('useWnSliderEditorApi');
  //----------------------------------------------------
  // 选择特性
  //----------------------------------------------------
  const selection = reactive<SelectableState<string>>({
    currentId: null,
    checkedIds: new Map<string, boolean>(),
    ids: [],
    lastSelectId: undefined,
    lastSelectIndex: -1,
  });
  //----------------------------------------------------
  const _selectable = computed(() => {
    return useSelectable<string>(
      {
        multi: true,
        getId: (item) => item.oid,
        canSelect: true,
        showChecker: true,
      },
      {
        getItem: (id: string) => {
          for (let i = 0; i < MediaListData.value.length; i++) {
            let it = MediaListData.value[i];
            if (it.oid == id) {
              return { rawData: it, id: it.oid, index: i };
            }
          }
        },
      }
    );
  });
  //----------------------------------------------------
  _selectable.value.resetSelection(selection);
  //----------------------------------------------------
  // 保持选中状态
  //----------------------------------------------------
  function getKeepName(tmpl: string) {
    if (props.meta && props.meta.id) {
      return Tmpl.exec(tmpl, props.meta);
    }
  }
  //----------------------------------------------------
  const _keep = useKeep({
    keepMode: 'local',
    keepAt: getKeepName('WnSliderEditor-${id}-Selection'),
  });
  //----------------------------------------------------
  function getKeepSelection() {
    return {
      currentId: selection.currentId,
      checkedIds: Util.mapToObj(selection.checkedIds),
    } as Vars;
  }
  //----------------------------------------------------
  function setKeepSelection(info: Vars) {
    if (_.isEmpty(info)) {
      selection.currentId = undefined;
      selection.checkedIds.clear();
    } else {
      selection.currentId = info.currentId || undefined;
      selection.checkedIds = Util.objToMap(info.checkedIds || {});
    }
  }
  //----------------------------------------------------
  function saveSelection() {
    let kinfo = getKeepSelection();
    _keep.save(kinfo);
  }
  //----------------------------------------------------
  let kinfo = _keep.loadObj() as Vars;
  setKeepSelection(kinfo);
  //----------------------------------------------------
  // 计算数据模型
  //----------------------------------------------------
  const SliderData = computed(() => {
    if (_.isEmpty(props.value)) {
      return {} as WnSlider;
    }
    if (_.isString(props.value)) {
      return JSON5.parse(props.value ?? '{}') as WnSlider;
    }
    return props.value as WnSlider;
  });
  //----------------------------------------------------
  const MediaListData = computed(() => {
    return _.map(SliderData.value?.medias ?? [], (it, index) => {
      return { ...it, index };
    });
  });
  //----------------------------------------------------
  const SliderFormData = computed(() => {
    return _.omit(SliderData.value, 'medias');
  });
  //----------------------------------------------------
  const CurrentMedia = computed(() => {
    return _.find(
      MediaListData.value,
      (item) => item.id == selection.currentId
    );
  });
  //----------------------------------------------------
  // 选择等方法
  //----------------------------------------------------
  function onSelect(payload: ListSelectEmitInfo) {
    selection.currentId = payload.currentId as string;
    selection.checkedIds = payload.checkedIds as Map<string, boolean>;
    saveSelection();
  }
  //----------------------------------------------------
  // 更新数据
  //----------------------------------------------------
  function notifyChange(data: WnSlider) {
    if (!_.isEqual(data, SliderData.value)) {
      let val: string | WnSlider = data;
      // 转换为 JSON
      if ('json' == props.valueType) {
        if ((props.formatJsonIndent ?? 0) > 0) {
          val = JSON.stringify(data, null, props.formatJsonIndent ?? 2);
        } else {
          val = JSON.stringify(data);
        }
      }
      // 转换为 JSON5
      else if ('json5' == props.valueType) {
        if ((props.formatJsonIndent ?? 0) > 0) {
          val = JSON5.stringify(data, null, props.formatJsonIndent ?? 2);
        } else {
          val = JSON5.stringify(data);
        }
      }
      // 通知改动
      emit('change', val);
    }
  }
  //----------------------------------------------------
  async function updateCurrentMedia(delta: Vars) {
    console.log('change', delta);
    if (CurrentMedia.value) {
      let index = CurrentMedia.value.index;
      // 如果更新了文件对象，需要修改一下 title
      if (delta.oid) {
        let obj = await Walnut.exec(`o 'id:${delta.oid}' @name @json -cqn`, {
          as: 'json',
        });
        if (obj) {
          delta.title = obj.title || obj.name || obj.nm || obj.id;
          delta.mime = obj.mime || null;
        }
      }

      let data = Util.jsonClone(SliderData.value);
      if (!data.medias) {
        data.medias = [];
      }
      // 更新当前媒体
      _.assign(data.medias[index], delta);

      // 通知改动
      notifyChange(data);
    }
  }
  //----------------------------------------------------
  function updateSliderData(delta: Vars) {
    let data = Util.jsonClone(SliderData.value);
    _.assign(data, delta);
    notifyChange(data);
  }
  //----------------------------------------------------
  // 操作方法
  //----------------------------------------------------
  function appendMedia(objs: WnObj[] = []) {
    // 防空
    if (_.isEmpty(objs)) {
      return;
    }

    // 合并对象
    let data = Util.jsonClone(SliderData.value);
    if (!data.medias) {
      data.medias = [];
    }
    for (let obj of objs) {
      data.medias.push({
        id: Alg.genSnowQ(6),
        oid: obj.id,
        title: obj.title || obj.name || obj.nm || obj.id,
        mime: obj.mime,
      });
    }

    // 通知改动
    notifyChange(data);
  }
  //----------------------------------------------------
  function removeCheckedMedias() {
    let data = Util.jsonClone(SliderData.value);
    if (!data.medias) {
      data.medias = [];
    }
    // 过滤
    else {
      data.medias = data.medias.filter((item, index) => {
        let id = _selectable.value.getDataId(item, index);
        return !selection.checkedIds.has(id);
      });
    }
  }
  //----------------------------------------------------
  function moveCheckedTo(dir: MoveDirection) {
    let data = Util.jsonClone(SliderData.value);
    if (!_.isEmpty(data.medias)) {
      data.medias = Util.moveChecked(
        data.medias ?? [],
        (it) => {
          return selection.checkedIds.has(it.id);
        },
        dir
      );

      // 通知改动
      notifyChange(data);
    }
  }
  //----------------------------------------------------
  // 输出特性
  //----------------------------------------------------
  return {
    // 选择状态
    selection,
    getKeepName,

    // 计算属性
    SliderData,
    MediaListData,
    SliderFormData,
    CurrentMedia,

    // 选择等方法
    onSelect,

    // 更新数据
    notifyChange,
    updateCurrentMedia,
    updateSliderData,

    // 操作方法
    appendMedia,
    removeCheckedMedias,
    moveCheckedTo,
  };
}
