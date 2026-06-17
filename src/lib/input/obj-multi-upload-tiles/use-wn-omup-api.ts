import {
  DataStoreActionStatus,
  getWnObjIcon,
  isWnObj,
  ObjDropToUploadOptions,
  useObjDropToUpload,
  useWnObj,
  Walnut,
  WnObj,
  WnObjWallSelectEmitInfo,
} from "@site0/ti-walnut";
import _ from "lodash";
import { computed, ref } from "vue";
import {
  WnObjMultiUploadTilesEmitter,
  WnObjMultiUploadTilesProps,
} from "./wn-omup-types";

import { Alert, Be, Confirm, Vars } from "@site0/tijs";

export type WnObjMultiUploadTilesApi = ReturnType<
  typeof useWnObjMultiUploadTilesApi
>;

export type WnObjMultiUploadTilesSetup = {
  emit: WnObjMultiUploadTilesEmitter;
  upload: ObjDropToUploadOptions;
};

export function useWnObjMultiUploadTilesApi(
  props: WnObjMultiUploadTilesProps,
  setup: WnObjMultiUploadTilesSetup
) {
  const { emit, upload } = setup;
  const objs = useWnObj();
  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const _mnt_home = ref<WnObj>();
  const _obj_list = ref<WnObj[]>([]);
  const _current_id = ref<string>();
  const _checked_ids = ref<string[]>([]);
  const _upload_api = useObjDropToUpload(upload);
  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const isEmpty = computed(() => _.isEmpty(_obj_list.value));
  const isBusy = computed(() => (props.status ? true : false));
  const isIdle = computed(() => (props.status ? false : true));
  //-----------------------------------------------------
  const BusyText = computed(() => {
    if (props.status) {
      return (
        {
          loading: "i18n:loading",
          saving: "i18n:saving",
          deleting: "i18n:del-ing",
        } as Record<DataStoreActionStatus, string>
      )[props.status];
    }
  });
  //-----------------------------------------------------
  const hasCurrent = computed(() => !_.isNil(_current_id.value));
  const hasChecked = computed(
    () => _checked_ids.value && _checked_ids.value.length > 0
  );
  //-----------------------------------------------------
  const CurrentId = computed(() => _current_id.value);
  const CheckedIds = computed(() => _checked_ids.value);
  const CurrentItem = computed(() => getCurrentItem());
  const CheckedItems = computed(() => getCheckedItems());
  //-----------------------------------------------------
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
  const HeadIcon = computed(() => {
    return getWnObjIcon(CurrentItem.value, "far-file");
  });
  //-----------------------------------------------------
  const HeadText = computed(() => {
    let text = `${ObjList.value.length} Files`;
    if (hasChecked.value) {
      text = `${CheckedItems.value.length} Selected/${ObjList.value.length} Files`;
    }
    return text;
  });
  //-----------------------------------------------------
  const HeadObjText = computed(() => {
    if (CurrentItem.value) {
      let obj = CurrentItem.value!;
      let text = obj.title || obj.nm;
      if (obj.tp && !text.endsWith(`.${obj.tp}`)) {
        text += `.${obj.tp}`;
      }
      return text;
    }
  });
  //-----------------------------------------------------
  const HeadObjHref = computed(() => {
    if (CurrentItem.value) {
      let obj = CurrentItem.value!;
      return `/attachment/${obj.id}`;
    }
  });
  //-----------------------------------------------------
  const ActionBarVars = computed((): Vars => {
    return {
      loading: props.status == "loading",
      saving: props.status == "saving",
      deleting: props.status == "deleting",
      busy: isBusy.value,
      idle: isIdle.value,
      empty: isEmpty.value,
      hasCurrent: hasCurrent.value,
      hasChecked: hasChecked.value,
      currentItem: CurrentItem.value,
    };
  });
  //-----------------------------------------------------
  // 帮助函数
  //-----------------------------------------------------
  function getCurrentItem(): WnObj | undefined {
    if (!_current_id.value) return undefined;
    return getItemById(_current_id.value);
  }
  //-----------------------------------------------------
  function getCheckedItems(): WnObj[] {
    return findItemsById(_checked_ids.value);
  }
  //-----------------------------------------------------
  function getItemById(id: string): WnObj | undefined {
    for (let obj of ObjList.value) {
      if (id == obj.id) {
        return obj;
      }
    }
  }
  //-----------------------------------------------------
  function findItemsById(ids: string[]): WnObj[] {
    let idSet = new Set<string>(ids);
    let re: WnObj[] = [];
    for (let obj of ObjList.value) {
      if (idSet.has(obj.id)) {
        re.push(obj);
      }
    }
    return re;
  }
  //-----------------------------------------------------
  // 操作函数
  //-----------------------------------------------------
  async function onSelect(payload: WnObjWallSelectEmitInfo) {
    let { currentId, checkedIds } = payload;
    _current_id.value = currentId ?? undefined;
    _checked_ids.value = checkedIds ?? [];
  }
  //-----------------------------------------------------
  async function doUploadFiles() {
    await _upload_api.doUploadFiles();
  }
  //-----------------------------------------------------
  async function tryUploadScreenshot() {
    await _upload_api.tryUploadImageFromClipboard();
  }
  //-----------------------------------------------------
  function downloadCurrentFile() {
    let o = getCurrentItem();
    if (!o) {
      Alert("Please Select a file to download", { type: "warn" });
      return;
    }
    let [url, options] = Walnut.getUrlForObjDownload(o.id, {
      withTicket: true,
      download: "force",
    });
    Be.OpenUrl(url, options);
  }
  //-----------------------------------------------------
  function open(obj: WnObj) {
    let url = `/attachment/${obj.id}`;
    Be.OpenUrl(url);
  }
  //-----------------------------------------------------
  // 数据改动
  //-----------------------------------------------------
  async function removeChecked() {
    let objs = getCheckedItems();

    // 防空
    if (_.isEmpty(objs)) {
      Alert("Please Select files to delete", { type: "warn" });
      return;
    }

    // 确认
    if (!(await Confirm("i18n:del-hard", { type: "warn" }))) {
      return;
    }

    emit("remove", objs);
  }
  //-----------------------------------------------------
  async function refresh() {
    emit("refresh");
  }
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
      //console.log(o.id);
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
    UploadApi: _upload_api,
    // 计算属性
    isEmpty,
    isBusy,
    isIdle,
    BusyText,
    hasCurrent,
    hasChecked,
    CurrentId,
    CheckedIds,
    CurrentItem,
    CheckedItems,
    ObjList,
    HeadIcon,
    HeadText,
    HeadObjText,
    HeadObjHref,
    ActionBarVars,
    // 帮助函数
    getCurrentItem,
    getCheckedItems,
    getItemById,
    findItemsById,
    // 操作函数
    onSelect,
    open,
    doUploadFiles,
    tryUploadScreenshot,
    downloadCurrentFile,
    // 数据改动
    removeChecked,
    refresh,
    // 远程操作
    reloadObjs,
    reloadMountHome,
    reload,
  };
}
