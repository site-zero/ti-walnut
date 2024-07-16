import _ from 'lodash';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useWnObj } from '../_features/use-wn-obj';
import { WnObj } from '../_top/wn-types';

export type ObjContentFinger = {
  id: string;
  len: number;
  sha1: string;
};

export type ObjContentStatus = 'loading' | 'saving';

export type ObjContentStoreFeature = {
  //---------------------------------------------
  // 数据模型
  _remote: Ref<string | undefined>;
  _local: Ref<string | undefined>;
  _finger: Ref<ObjContentFinger | undefined>;
  //---------------------------------------------
  status: Ref<ObjContentStatus | undefined>;
  //---------------------------------------------
  // 计算属性
  contentText: ComputedRef<string>;
  changed: ComputedRef<boolean>;
  loaded: ComputedRef<boolean>;
  //---------------------------------------------
  // 本地方法
  setContent: (content: string) => void;
  resetLocalChange: () => void;
  isSameFinger: (finger: ObjContentFinger) => boolean;
  //---------------------------------------------
  // 远程方法
  saveChange: (force?: boolean) => Promise<WnObj | undefined>;
  loadContent: (
    finger: ObjContentFinger,
    resetLocal?: boolean
  ) => Promise<string>;
  refreshContent: (resetLocal?: boolean) => Promise<string>;
};

export function useObjContentStore(): ObjContentStoreFeature {
  //---------------------------------------------
  // 准备数据访问模型
  //---------------------------------------------
  const _obj = useWnObj();
  //                 建立数据模型
  //---------------------------------------------
  const _remote = ref<string>();
  const _local = ref<string>();
  const _status = ref<ObjContentStatus>();
  const _finger = ref<ObjContentFinger>();

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

  //---------------------------------------------
  //                 计算属性
  //---------------------------------------------
  const contentText = computed(() => {
    return _local.value ?? _remote.value ?? '';
  });

  const changed = computed(() => isChanged());
  const loaded = computed(() => {
    if (_finger.value && _finger.value.id) {
      return true;
    }
    return false;
  });
  //---------------------------------------------
  //                 本地方法
  //---------------------------------------------
  function setContent(content: string) {
    _local.value = content;
  }

  function resetLocalChange() {
    _local.value = undefined;
  }

  function isSameFinger(finger: ObjContentFinger) {
    if (_finger.value) {
      let { id, sha1, len } = _finger.value;
      return id == finger.id && sha1 == finger.sha1 && len == finger.len;
    }
    return false;
  }
  //---------------------------------------------
  //                远程方法
  //---------------------------------------------
  async function saveChange(force = false): Promise<WnObj | undefined> {
    // 防守一下
    if (!isChanged() && !force) {
      return;
    }
    // 再防守一下
    if (!_finger.value) {
      throw 'Before saveChange, you should load finger at first';
    }
    // 准备目标
    let path = `id:${_finger.value.id}`;
    // 执行
    _status.value = 'saving';
    let re = await _obj.writeText(path, _local.value ?? '');
    _remote.value = _local.value;
    _local.value = undefined;
    _status.value = undefined;
    return re;
  }
  //---------------------------------------------
  async function loadContent(
    finger: ObjContentFinger,
    resetLocal = true
  ): Promise<string> {
    _finger.value = { ...finger };
    return await refreshContent(resetLocal);
  }
  //---------------------------------------------
  async function refreshContent(resetLocal = true): Promise<string> {
    // 防守一下
    if (!_finger.value) {
      throw 'Before refreshContent, you should load finger at first';
    }
    // 准备目标
    let path = `id:${_finger.value.id}`;
    // 执行
    _status.value = 'loading';
    let re = await _obj.loadContent(path);
    _remote.value = re;
    _status.value = undefined;

    if (resetLocal) {
      resetLocalChange();
    }

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
    _finger,
    //---------------------------------------------
    status: _status,
    //---------------------------------------------
    // 计算属性
    contentText,
    changed,
    loaded,
    //---------------------------------------------
    // 本地方法
    setContent,
    resetLocalChange,
    isSameFinger,
    //---------------------------------------------
    // 远程方法
    saveChange,
    loadContent,
    refreshContent,
  };
}
