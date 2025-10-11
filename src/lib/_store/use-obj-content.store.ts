import { ObjDataStatus, Vars, Util } from "@site0/tijs";
import { diffLines } from "diff";
import _ from "lodash";
import { computed, ref } from "vue";
import { useWnObj } from "../_features/use-wn-obj";
import { WnObj, WnObjContentFinger } from "../_types/wn-types";

export type ObjContentDiff = {
  finger: WnObjContentFinger;
  remote: string;
  local: string;
};

export type ObjContentStoreFeature = ReturnType<typeof useObjContentStore>;

export function useObjContentStore() {
  //---------------------------------------------
  // 准备数据访问模型
  //---------------------------------------------
  const _obj = useWnObj();
  //                 建立数据模型
  //---------------------------------------------
  const _remote = ref<string>();
  const _local = ref<string>();
  const _status = ref<ObjDataStatus>("empty");
  const _finger = ref<WnObjContentFinger>();

  /**
   * 判断本地端是否发生改变。当然如果远端不存在，本地端如果有值就是改变
   * @returns
   */
  function isChanged() {
    if (!_.isNil(_local.value)) {
      return _local.value != _remote.value;
    }
    return false;
  }

  function getChange(): Vars[] {
    if (!isChanged()) {
      return [];
    }
    return diffLines(_remote.value ?? "", _local.value ?? "");
  }

  //---------------------------------------------
  //                 计算属性
  //---------------------------------------------
  const ContentText = computed(() => {
    return _local.value ?? _remote.value ?? "";
  });
  const ContentType = computed(() => {
    return _finger.value?.tp || "txt";
  });
  const ContentMime = computed(() => {
    return _finger.value?.mime || "text/plain";
  });
  const ContentLenght = computed(() => {
    return _finger.value?.len || 0;
  });
  const ContentSha1 = computed(() => {
    return _finger.value?.sha1;
  });

  const changed = computed(() => isChanged());
  //---------------------------------------------
  //                 本地方法
  //---------------------------------------------
  function setContent(content: string) {
    _local.value = content;
  }

  function dropLocalChange() {
    _local.value = undefined;
  }

  function reset() {
    _remote.value = undefined;
    _local.value = undefined;
    _status.value = "empty";
    _finger.value = undefined;
  }

  function isSameFinger(finger: WnObjContentFinger) {
    if (_finger.value) {
      let { id, sha1, len } = _finger.value;
      return id == finger.id && sha1 == finger.sha1 && len == finger.len;
    }
    return false;
  }
  //---------------------------------------------
  //                远程方法
  //---------------------------------------------
  async function saveChange({ force = false } = {}): Promise<
    WnObj | undefined
  > {
    // 防守一下
    if (!isChanged() && !force) {
      return;
    }
    // 再防守一下
    if (!_finger.value) {
      throw "Before saveChange, you should load finger at first";
    }
    // 准备目标
    let path = `id:${_finger.value.id}`;
    // 执行
    _status.value = "saving";
    let str = Util.jsonClone(_local.value ?? "");
    let re = await _obj.writeText(path, str);
    _remote.value = str;
    _local.value = undefined;
    _finger.value.len = re.len;
    _finger.value.sha1 = re.sha1;
    _status.value = "ready";
    return re;
  }
  //---------------------------------------------
  async function loadContent(
    finger: WnObjContentFinger,
    resetLocal = true
  ): Promise<string> {
    _finger.value = { ...finger };
    return await refreshContent(resetLocal);
  }
  //---------------------------------------------
  async function refreshContent(resetLocal = true): Promise<string> {
    // 防守一下
    if (!_finger.value) {
      throw "Before refreshContent, you should load finger at first";
    }
    // 重置本地改动
    if (resetLocal) {
      dropLocalChange();
    }
    // 重置远程改动
    _remote.value = undefined;
    // 准备目标
    let path = `id:${_finger.value.id}`;
    // 执行
    _status.value = "loading";
    let re = await _obj.loadContent(path);
    if (_.isNil(re)) {
      re = "";
    }
    _remote.value = re;
    _status.value = "ready";

    return re;
  }
  //---------------------------------------------
  //                输出特性
  //---------------------------------------------
  return {
    //---------------------------------------------
    // 数据模型
    _remote,
    _local,
    //---------------------------------------------
    status: _status,
    //---------------------------------------------
    // 计算属性
    ContentText,
    ContentType,
    ContentMime,
    ContentLenght,
    ContentSha1,
    Finger: computed(() => _finger.value),
    changed,
    //---------------------------------------------
    // 本地方法
    setContent,
    dropLocalChange,
    reset,
    isSameFinger,
    getChange,
    //---------------------------------------------
    // 远程方法
    saveChange,
    loadContent,
    refreshContent,
  };
}
