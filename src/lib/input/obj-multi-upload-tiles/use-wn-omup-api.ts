import { isWnObj, useWnObj, WnObj } from "@site0/ti-walnut";
import _ from "lodash";
import { computed, ref } from "vue";
import {
  WnObjMultiUploadTailEmitter,
  WnObjMultiUploadTailProps,
} from "./wn-omup-types";

export type WnObjMultiUploadTailApi = ReturnType<
  typeof useWnObjMultiUploadTailApi
>;

export function useWnObjMultiUploadTailApi(
  props: WnObjMultiUploadTailProps,
  _emit: WnObjMultiUploadTailEmitter
) {
  const objs = useWnObj();
  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const _mnt_home = ref<WnObj>();
  const _obj_list = ref<WnObj[]>([]);
  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const isEmpty = computed(() => _.isEmpty(_obj_list.value));
  const ObjList = computed(() => {
    const homeId = _mnt_home.value ? _mnt_home.value.id : undefined;
    let re = _.cloneDeep(_obj_list.value);
    for (let o of re) {
      // 强制设置上 homeId 前缀
      if (homeId && !o.id.startsWith(homeId)) {
        o.id = `${homeId}:${o.id}`;
      }
    }
    return re;
  });
  //-----------------------------------------------------
  // 帮助函数
  //-----------------------------------------------------
  //-----------------------------------------------------
  // 操作函数
  //-----------------------------------------------------

  //-----------------------------------------------------
  // 数据改动
  //-----------------------------------------------------

  //-----------------------------------------------------
  // 远程操作
  //-----------------------------------------------------
  async function reloadObjs() {
    let load_ids = [] as string[];
    let load_objs = new Map<string, WnObj>();
    let list_ids = [] as string[];

    // 检索归纳输入值
    for (let oid of props.value || []) {
      if (isWnObj(oid)) {
        load_objs.set(oid.id, _.cloneDeep(oid));
        list_ids.push(oid.id);
      } else {
        load_ids.push(oid);
      }
    }

    // 加载对象数据
    let remote_objs = [] as WnObj[];
    if (load_ids.length > 0) {
      if ("id" == props.valueType) {
        remote_objs = await objs.getBy(...load_ids);
      } else {
        remote_objs = await objs.fetchBy(...load_ids);
      }
    }

    // 归纳
    for (let o of remote_objs) {
      load_objs.set(o.id, o);
    }

    // 得到最后列表
    let list = [] as WnObj[];
    for (let oid of list_ids) {
      let o = load_objs.get(oid) || {
        id: oid,
        nm: "-no-exists-",
        race: "FILE",
      };
      // 加入列表
      list.push(o);
    }

    // 计入本地状态
    _obj_list.value = list;
  }

  //-----------------------------------------------------
  async function reloadMountHome() {
    if (props.mountHome) {
      if (isWnObj(props.mountHome)) {
        _mnt_home.value = _.cloneDeep(props.mountHome);
      } else {
        _mnt_home.value = await objs.fetch(props.mountHome);
      }
    } else {
      _mnt_home.value = undefined;
    }
  }
  //-----------------------------------------------------
  async function reload() {
    await reloadMountHome();
    await reloadObjs();
  }
  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    _mnt_home,
    _obj_list,
    // 计算属性
    isEmpty,
    ObjList,
    // 操作函数
    // 数据改动
    // 远程操作
    reloadObjs,
    reloadMountHome,
    reload,
  };
}
