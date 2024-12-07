import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  LocalMetaEditOptions,
  useLocalMetaEdit,
  useWnObj,
  WnObj,
} from '../../';
import { ObjContentFinger, useObjContentStore } from '../use-obj-content.store';

export type StdMetaStore = ReturnType<typeof defineStdMetaStore>;

export type StdMetaStoreOptions = LocalMetaEditOptions & {
  /**
   * 对象路径，通常就是一个文件对象
   */
  objPath: string;
  /**
   * 保存后自动刷新结果
   */
  refreshWhenSave?: boolean;
  /**
   * 读取 remote 列表后，固定的修改补充信息逻辑
   *
   * @param remote 远端查询结果对象
   * @param index 数据下标 (0 base)
   * @returns
   */
  patchRemote?: (remote: WnObj, index: number) => WnObj;
};

function defineStdMetaStore(options: StdMetaStoreOptions) {
  //---------------------------------------------
  // 准备数据访问模型
  let _options: StdMetaStoreOptions = _.cloneDeep(options);
  const _obj = useWnObj();
  //---------------------------------------------
  /**
   * 开启这个选项，如果选择的当前对象是一个文件，那么就自动加载内容
   */
  const _auto_load_content = ref<boolean>(false);
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const _remote = ref<WnObj>();
  const _action_status = ref<DataStoreActionStatus>();
  const _content = useObjContentStore();
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = computed(() => useLocalMetaEdit(_remote, _options));
  //---------------------------------------------
  const ActionStatus = computed(() => _action_status.value);
  //---------------------------------------------
  const LoadStatus = computed((): DataStoreLoadStatus => {
    if (_.isUndefined(_remote.value)) {
      return 'unloaded';
    }
    return 'full';
  });

  //---------------------------------------------
  // 读写内容
  //---------------------------------------------
  function getCurrentContentFinger(): ObjContentFinger | undefined {
    // 防空
    if (!metaData.value) {
      return;
    }

    // 读取指纹
    let { id, len, sha1, mime, tp } = metaData.value;
    return { id, len, sha1, mime, tp };
  }

  /**
   * 加载当前内容。
   *
   * 该函数首先检查 `CurrentItem.value` 是否存在，如果不存在则直接返回。
   * 如果存在，则将 `_action_status.value` 设置为 'loading'，然后根据 `_current_id.value` 加载内容并赋值给 `_content.value`。
   * 最后将 `_action_status.value` 置为 undefined。
   *
   * @returns {Promise<void>} 一个表示异步操作的 Promise 对象。
   */
  async function loadCurrentContent() {
    // 读取指纹
    let finger = getCurrentContentFinger();

    // 防空
    if (!finger) {
      return;
    }

    // 读取内容
    _action_status.value = 'loading';
    await _content.loadContent(finger);
    _action_status.value = undefined;
  }

  /**
   * 设置当前内容。
   *
   * @param content - 要设置的内容字符串。
   *
   * 如果 `CurrentItem.value` 为空，则不会设置内容。
   */
  function setCurrentContent(content: string) {
    // 防空
    if (!metaData.value) {
      return;
    }
    _content.setContent(content);
  }

  /**
   * 保存当前内容。
   *
   * 如果当前项为空，则直接返回。
   * 否则，将当前内容保存到指定对象中，并更新操作状态。
   *
   * @async
   * @function
   * @returns {Promise<void>} 无返回值
   */
  async function saveCurrentContent() {
    // 防空
    if (!metaData.value) {
      return;
    }
    // 保存内容
    _action_status.value = 'saving';
    await _content.saveChange();
    _action_status.value = undefined;
  }
  //---------------------------------------------
  // 基础本地方法
  //---------------------------------------------
  function resetLocalChange() {
    _local.value.reset();
  }

  function clearRemoteList() {
    _remote.value = undefined;
  }

  function setOptions(opt: StdMetaStoreOptions) {
    _options = _.cloneDeep(opt);
  }

  function assignOptions(opt: Partial<StdMetaStoreOptions>) {
    _.assign(_options, opt);
  }

  async function __try_auto_load_content() {
    if (_auto_load_content.value) {
      let finger = getCurrentContentFinger();
      if (finger && !_content.isSameFinger(finger)) {
        await loadCurrentContent();
      }
    }
  }

  async function setAutoLoadContent(value: boolean) {
    _auto_load_content.value = value;
    await __try_auto_load_content();
  }

  //---------------------------------------------
  //                 被内部重用的方法
  //---------------------------------------------
  const metaData = computed(() => {
    return _local.value.localMeta.value || _remote.value || {};
  });

  function updateMeta(meta: Vars) {
    _local.value.updateMeta(meta);
  }

  function setMeta(meta: Vars) {
    _local.value.setMeta(meta);
  }

  function setRemoteMeta(meta: Vars) {
    _remote.value = _.cloneDeep(meta);
  }

  function clear() {
    _local.value.reset();
  }

  //---------------------------------------------
  // 初始化本地数据
  //---------------------------------------------
  async function init(options?: StdMetaStoreOptions) {
    if (options) {
      setOptions(options);
    }

    // 读取数据
    await reload();
  }

  /**
   * 重新加载数据的异步函数。
   *
   * 此函数执行以下操作：
   * 1. 调用 `resetLocalChange` 函数重置本地更改。
   * 2. 调用 `queryRemoteList` 函数查询远程列表。
   *
   * @async
   * @function reload
   * @returns {Promise<void>} 返回一个 Promise 对象，表示异步操作的完成。
   */
  async function reload() {
    resetLocalChange();
    await refresh();
  }

  /**
   * 刷新远程列表数据。
   *
   * 该异步函数调用 `queryRemoteList` 函数以刷新远程列表数据。
   *
   * @async
   * @function
   * @returns {Promise<void>} 返回一个 Promise 对象，表示刷新操作的完成。
   */
  async function refresh() {
    if (_options.objPath) {
      _remote.value = await _obj.fetch(_options.objPath);
    } else {
      _remote.value = undefined;
    }
  }

  /*---------------------------------------------
                        
                      输出特性
      
      ---------------------------------------------*/
  return {
    // 数据模型
    _local,
    _remote,
    //status: _action_status,

    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    ActionStatus,
    LoadStatus,
    changed: computed(() => _local.value.isChanged()),
    CurrentContent: computed(() => _content.ContentText.value),
    metaData,
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocalChange,
    clearRemoteList,
    clear,
    updateMeta,
    //---------------------------------------------
    loadCurrentContent,
    setCurrentContent,
    saveCurrentContent,
    //---------------------------------------------
    // 本地化存储状态
    //---------------------------------------------
    setAutoLoadContent,
    assignOptions,
    setOptions,

    //---------------------------------------------
    //                  远程方法
    //---------------------------------------------
    init,
    reload,
    refresh,
  };
}

/**
 * 维持全局单例
 */
//const _stores = new Map<string, DataListStoreFeature>();

export function useStdMetaStore(options: StdMetaStoreOptions): StdMetaStore {
  return defineStdMetaStore(options);
}
