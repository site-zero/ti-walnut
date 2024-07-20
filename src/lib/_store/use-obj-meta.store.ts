import { FieldStatus, Util, Vars } from '@site0/tijs';
import _ from 'lodash';
import { computed, ComputedRef, Ref, ref } from 'vue';
import { WnMetaSaving, WnObj } from '../../..';
import { ObjContentFinger } from './use-obj-content.store';

export type ObjMetaStoreFeature = {
  //---------------------------------------------
  // 数据模型
  _remote: any;
  _local: any;
  //---------------------------------------------
  status: Ref<Record<string, FieldStatus>>;
  //---------------------------------------------
  // 计算属性
  metaData: ComputedRef<WnObj>;
  metaFinger: ComputedRef<ObjContentFinger | undefined>;
  changed: ComputedRef<boolean>;
  isNoEmptyFile: ComputedRef<boolean>;
  isFILE: ComputedRef<boolean>;
  isDIR: ComputedRef<boolean>;
  //---------------------------------------------
  // 本地方法
  updateMeta: (meta: Vars) => void;
  setMeta: (meta: Vars) => void;
  initMeta: (meta?: Vars) => void;
  dropLocalChange: () => void;
  clearStatus: (keys?: string[]) => void;
  //---------------------------------------------
  // 远程方法
  saveChange: () => Promise<WnObj | undefined>;
};

export type ObjMetaStoreOptions = {
  saving: ComputedRef<WnMetaSaving>;
};

function defineObjMetaStore(options: ObjMetaStoreOptions): ObjMetaStoreFeature {
  //---------------------------------------------
  // 准备数据访问模型
  let { saving } = options;
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const _remote = ref<WnObj>();
  const _local = ref<WnObj>();
  const _status = ref<Record<string, FieldStatus>>({});

  /**
   * 判断当前编辑的是否是远端不存在的数据
   *
   * @returns true: 远端不存在 false: 远端存在
   */
  function isNew() {
    return _remote.value?.id ? false : true;
  }

  /**
   * 判断本地端是否发生改变。当然如果远端不存在，本地端如果有值就是改变
   * @returns
   */
  function isChanged() {
    if (_local.value) {
      //   if (isNew()) {
      //     return true;
      //   }
      //   if (_.isEqual(_local.value, _remote.value)) {
      //     return false;
      //   }
      //   return true;
      return isNew() || !_.isEqual(_local.value, _remote.value);
    }
    return false;
  }

  //---------------------------------------------
  //                 计算属性
  //---------------------------------------------
  const metaData = computed(() => {
    return _local.value ?? _remote.value ?? {};
  });

  const metaFinger = computed(() => {
    if (metaData.value) {
      let { id, sha1 = '', len = 0, mime = '', tp = '' } = metaData.value;
      return { id, sha1, len, mime, tp } as ObjContentFinger;
    }
  });

  const changed = computed(() => isChanged());

  const isDIR = computed(() => {
    return 'FILE' == metaData.value?.race;
  });

  const isFILE = computed(() => {
    return 'FILE' == metaData.value?.race;
  });

  const isNoEmptyFile = computed(() => {
    let { race, len, sha1 } = metaData.value;
    return 'FILE' == race && len > 0 && !_.isEmpty(sha1);
  });
  //---------------------------------------------
  //                 本地方法
  //---------------------------------------------
  function updateMeta(meta: Vars) {
    if (!_local.value) {
      _local.value = _.cloneDeep(_remote.value ?? {});
    }
    _.assign(_local.value, meta);
  }

  function setMeta(meta: WnObj) {
    _local.value = _.cloneDeep(meta);
  }

  function initMeta(meta?: WnObj) {
    _local.value = undefined;
    if (meta) {
      _remote.value = _.cloneDeep(meta);
    } else {
      _remote.value = undefined;
    }
  }

  function dropLocalChange() {
    _local.value = undefined;
  }

  function setStatus(keys: string[], status: FieldStatus) {
    for (let key of keys) {
      _status.value[key] = status;
    }
  }

  function clearStatus(keys?: string[]) {
    if (!keys || _.isEmpty(keys)) {
      _status.value = {};
    } else {
      _status.value = _.omit(_status.value, keys);
    }
  }

  //---------------------------------------------
  //                远程方法
  //---------------------------------------------
  async function saveChange(): Promise<WnObj | undefined> {
    if (!isChanged() || !_local.value) {
      return;
    }
    let diff = Util.getRecordDiff(_remote.value ?? {}, _local.value ?? {});
    let keys = _.keys(diff);
    setStatus(keys, { type: 'pending' });
    // 新建对象
    let meta: WnObj | undefined;
    if (isNew()) {
      meta = await saving.value.create(_local.value);
    }
    // 更新对象
    else {
      meta = await saving.value.update(_local.value);
    }

    if (meta) {
      initMeta(meta);
    }

    setStatus(keys, { type: 'ok' });
    _.delay(() => {
      clearStatus();
    }, 500);

    return meta;
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
    metaData,
    metaFinger,
    changed,
    isFILE,
    isDIR,
    isNoEmptyFile,
    //---------------------------------------------
    // 本地方法
    updateMeta,
    setMeta,
    initMeta,
    dropLocalChange,
    clearStatus,
    //---------------------------------------------
    // 远程方法
    saveChange,
  };
}

export function useObjMetaStore(options: ObjMetaStoreOptions) {
  return defineObjMetaStore(options);
}
