import { IDSelection, Pager, TableSelectEmitInfo, Util } from "@site0/tijs";
import _ from "lodash";
import { computed, ref } from "vue";
import { useWnObj } from "../../..";
import { WnObj } from "../../../../_types";
import { WnUploadFileOptions } from "../../../../core";
import {
  WnObjBrowserEmitter,
  WnObjBrowserLoadMode,
  WnObjBrowserProps,
} from "./wn-obj-browser-types";

export type WnObjBrowserApi = ReturnType<typeof useWnObjBrowserApi>;

export function useWnObjBrowserApi(
  props: WnObjBrowserProps,
  _emit: WnObjBrowserEmitter
) {
  //-----------------------------------------------------
  // 操作接口
  //-----------------------------------------------------
  const objApi = useWnObj(props.homePath);
  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const _loading = ref(false);
  const _obj_list = ref<WnObj[]>([]);
  const _obj_pager = ref<Pager>({});
  const _obj_path = ref<WnObj[]>([]);
  const _current_dir_id = ref<string>();
  const _sel_obj = ref<IDSelection<string>>({});

  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const LoadMode = computed((): WnObjBrowserLoadMode => {
    if ("worker" == props.loadMode || "puppet" == props.loadMode) {
      return props.loadMode;
    }
    if (_.isString(props.homePath)) {
      return "worker";
    }
    return "puppet";
  });
  const ObjList = computed(() => _obj_list.value);
  const ObjPath = computed(() => _obj_path.value);
  const Pager = computed(() => _obj_pager.value);
  const loading = computed(() => _loading.value);
  const CurrentDirId = computed(() => _current_dir_id.value);
  //-----------------------------------------------------
  const CurrentObj = computed(() => {
    return _.find(ObjList.value, { id: _sel_obj.value.currentId });
  });
  //-----------------------------------------------------
  const CheckedObjs = computed(() => {
    let ids = Util.arrayToMap(_sel_obj.value.checkedIds);
    return _.filter(ObjList.value, (obj) => ids.get(obj.id));
  });
  //-----------------------------------------------------
  const UploadConfig = computed((): WnUploadFileOptions | undefined => {
    if (!props.homePath) {
      return;
    }
    return {
      target: props.homePath,
      mode: "a",
    };
  });
  //-----------------------------------------------------
  // 状态修改函数
  //-----------------------------------------------------
  function onSelect(payload: TableSelectEmitInfo) {
    _sel_obj.value = {
      currentId: payload.currentId as string,
      checkedIds: payload.checkedIds as string[],
    };
  }
  //-----------------------------------------------------
  // 远程加载函数
  //-----------------------------------------------------
  async function _load_obj_list() {
    const [list, pager] = await objApi.queryChildren(
      {
        filter: {},
        sorter: { nm: 1 },
        pager: { pageNumber: 1, pageSize: 100 },
      },
      {
        mine: true,
        hidden: true,
        loadPath: false,
      }
    );
    _obj_list.value = list;
    _obj_pager.value = pager;
  }
  //-----------------------------------------------------
  async function _load_obj_path() {
    _obj_path.value = await objApi.getAncestors({
      includeSelft: true,
      until: "~",
    });
  }
  //-----------------------------------------------------
  async function reload() {
    // 外部指定了数据
    if (LoadMode.value == "puppet") {
      _obj_list.value = props.objList ?? [];
      _obj_path.value = props.objPath ?? [];
      _current_dir_id.value = props.currentDirId;
    }
    // 自行加载数据
    else {
      _loading.value = true;
      await Promise.all([_load_obj_list(), _load_obj_path()]);
      let obj = _.last(_obj_path.value);
      if (obj) {
        _current_dir_id.value = obj.id;
      } else {
        _current_dir_id.value = undefined;
      }
      _loading.value = false;
    }
  }
  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    _obj_list,
    _obj_path,
    _current_dir_id,
    // 计算属性
    LoadMode,
    ObjList,
    ObjPath,
    Pager,
    loading,
    CurrentDirId,
    CurrentObj,
    CheckedObjs,
    CurrentObjId: computed(() => _sel_obj.value.currentId),
    CheckedObjIds: computed(() => _sel_obj.value.checkedIds),
    UploadConfig,
    // 状态修改函数
    onSelect,

    // 远程加载函数
    reload,
  };
}
