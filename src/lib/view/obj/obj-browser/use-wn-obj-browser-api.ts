import _ from "lodash";
import { computed, ref } from "vue";
import { useWnObj } from "../../..";
import { WnObj } from "../../../../_types";
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
  const _obj_path = ref<WnObj[]>([]);
  const _current_dir_id = ref<string>();

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
  const loading = computed(() => _loading.value);
  const CurrentDirId = computed(() => _current_dir_id.value);

  //-----------------------------------------------------
  // 状态修改函数
  //-----------------------------------------------------

  //-----------------------------------------------------
  // 远程加载函数
  //-----------------------------------------------------
  async function _load_obj_list() {
    _obj_list.value = await objApi.queryChildren(
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
    loading,
    CurrentDirId,

    // 状态修改函数

    // 远程加载函数
    reload,
  };
}
