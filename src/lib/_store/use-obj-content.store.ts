import { ObjDataStatus } from '@site0/tijs';
import _ from 'lodash';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useWnObj } from '../_features/use-wn-obj';
import { WnObjContentFinger, WnObj } from '../_types/wn-types';

export type ObjContentStoreFeature = {
  //---------------------------------------------
  // 数据模型
  _remote: Ref<string | undefined>;
  _local: Ref<string | undefined>;
  _finger: Ref<WnObjContentFinger | undefined>;
  //---------------------------------------------
  status: Ref<ObjDataStatus | undefined>;
  //---------------------------------------------
  // 计算属性
  ContentText: ComputedRef<string>;
  ContentType: ComputedRef<string>;
  ContentMime: ComputedRef<string>;
  changed: ComputedRef<boolean>;
  //---------------------------------------------
  // 本地方法
  setContent: (content: string) => void;
  dropLocalChange: () => void;
  reset: () => void;
  isSameFinger: (finger: WnObjContentFinger) => boolean;
  //---------------------------------------------
  // 远程方法
  saveChange: (force?: boolean) => Promise<WnObj | undefined>;
  loadContent: (
    finger: WnObjContentFinger,
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
  const _status = ref<ObjDataStatus>('empty');
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

  //---------------------------------------------
  //                 计算属性
  //---------------------------------------------
  const ContentText = computed(() => {
    return _local.value ?? _remote.value ?? '';
  });
  const ContentType = computed(() => {
    return _finger.value?.tp || 'txt';
  });
  const ContentMime = computed(() => {
    return _finger.value?.mime || 'text/plain';
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
    _status.value = 'empty';
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
    let str = _.cloneDeep(_local.value ?? '');
    let re = await _obj.writeText(path, str);
    _remote.value = str;
    _local.value = undefined;
    _status.value = 'ready';
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
      throw 'Before refreshContent, you should load finger at first';
    }
    // 准备目标
    let path = `id:${_finger.value.id}`;
    // 执行
    _status.value = 'loading';
    let re = await _obj.loadContent(path);
    if (_.isNil(re)) {
      re = '';
    }
    _remote.value = re;
    _status.value = 'ready';

    if (resetLocal) {
      dropLocalChange();
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
    ContentText,
    ContentType,
    ContentMime,
    changed,
    //---------------------------------------------
    // 本地方法
    setContent,
    dropLocalChange,
    reset,
    isSameFinger,
    //---------------------------------------------
    // 远程方法
    saveChange,
    loadContent,
    refreshContent,
  };
}
