import {
  Alert,
  apply_conflict,
  buildConflict,
  BuildConflictItemOptions,
  buildDifferentItem,
  Util,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { computed, ref } from "vue";
import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  isWnObj,
  LocalMetaEditOptions,
  MetaStoreConflicts,
  RefreshOptions,
  useLocalMetaEdit,
  useWnObj,
  WnObj,
  WnObjContentFinger,
} from "../../";
import { getObjContentFinger } from "../../../core";
import { useObjContentStore } from "../use-obj-content.store";

export type StdMetaStoreApi = ReturnType<typeof defineStdMetaStore>;

export type StdMetaStoreOptions = LocalMetaEditOptions & {
  /**
   * 对象路径，通常就是一个文件对象
   */
  objPath: string | WnObj;
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

  /**
   * 是否自动加载内容。
   *
   * > 通常，这个选项可以不设置，在界面如果显示内容，会主动设置对应的状态
   *
   * @default false
   */
  autoLoadContent?: boolean;
};

function defineStdMetaStore(options?: StdMetaStoreOptions) {
  //---------------------------------------------
  // 准备数据访问模型
  let _options: StdMetaStoreOptions = Util.jsonClone(
    options ?? { objPath: "~" }
  );
  const _obj = useWnObj();
  //---------------------------------------------
  /**
   * 开启这个选项，如果选择的当前对象是一个文件，那么就自动加载内容
   */
  const _auto_load_content = ref<boolean>(options?.autoLoadContent ?? false);
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const _remote = ref<WnObj>();
  const _action_status = ref<DataStoreActionStatus>();
  const _content = useObjContentStore();
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = useLocalMetaEdit(_remote, _options);
  //---------------------------------------------
  const MetaData = computed(() => {
    return _local.localMeta.value || _remote.value || {};
  });
  //---------------------------------------------
  const MetaId = computed(() => MetaData.value.id);
  //---------------------------------------------
  const changed = computed(() => _local.isChanged() || _content.changed.value);
  //---------------------------------------------
  const ActionStatus = computed(() => _action_status.value);
  //---------------------------------------------
  const ActionBarVars = computed(() => {
    return {
      loading: _action_status.value == "loading",
      saving: _action_status.value == "saving",
      changed: changed.value,
    } as Vars;
  });
  //---------------------------------------------
  const LoadStatus = computed((): DataStoreLoadStatus => {
    if (_.isUndefined(_remote.value)) {
      return "unloaded";
    }
    return "full";
  });

  //---------------------------------------------
  // 读写元数据
  //---------------------------------------------
  async function saveMeta() {
    if (!MetaId.value) {
      await Alert("StdMeta without init data.id", { type: "danger" });
    }
    let diff = _local.getDiffMeta();
    if (_.isEmpty(diff)) {
      return;
    }
    diff.id = MetaId.value;
    _action_status.value = "saving";
    let re = await _obj.update(diff);
    if (re) {
      _remote.value = re;
    }
    _action_status.value = undefined;
  }
  //---------------------------------------------
  function makeMetaDifferent() {
    return _local.getDiffMeta();
  }
  //---------------------------------------------
  function makeContentDifferents(): Vars[] {
    return _content.getChange();
  }
  //---------------------------------------------
  // 冲突
  //---------------------------------------------
  async function makeConflict(
    options: BuildConflictItemOptions = {}
  ): Promise<MetaStoreConflicts | undefined> {
    // 首先从服务器拉取数据，然后我们就有了三个数据版本
    let server = await loadRemoteMeta();

    // 比对差异
    return createConflictBy(server, options);
  }

  function createConflictBy(
    server: WnObj | undefined,
    options: BuildConflictItemOptions
  ): MetaStoreConflicts {
    // 首先从服务器拉取数据，然后我们就有了三个数据版本
    let local = _local.localMeta.value;
    let remote = _remote.value;

    // 比对差异
    let myDiff = buildDifferentItem(local, remote);
    let taDiff = buildDifferentItem(server, remote);

    // 算冲突
    let conflict = buildConflict(myDiff, taDiff, options);
    return {
      server,
      local,
      remote,
      localDiff: myDiff,
      remoteDiff: taDiff,
      conflict,
    };
  }

  /**
   * 解决冲突，首先将 server 数据覆盖 remote
   * 然后除了冲突的字段， local 的字段全部用 server 字段替换
   */
  function applyConflicts(cf: MetaStoreConflicts) {
    let { server, localDiff } = cf;
    _remote.value = server;
    apply_conflict(_local.localMeta, server, localDiff);
  }
  //---------------------------------------------
  // 读写内容
  //---------------------------------------------
  function getCurrentContentFinger(): WnObjContentFinger | undefined {
    // 防空
    if (!MetaData.value) {
      return;
    }

    // 读取指纹
    return getObjContentFinger(MetaData.value);
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
    _action_status.value = "loading";
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
    if (!MetaData.value) {
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
    if (!MetaData.value) {
      return;
    }
    // 保存内容
    _action_status.value = "saving";
    let newObj = await _content.saveChange();
    if (newObj) {
      _remote.value = newObj;
      // 更新本地元数据，更正内容相关的键
      _local.updateMeta({
        len: _content.ContentLenght.value,
        sha1: _content.ContentSha1.value,
      });
    }
    _action_status.value = undefined;
  }
  //---------------------------------------------
  // 基础本地方法
  //---------------------------------------------
  function resetLocalChange() {
    _local.reset();
    _content.reset();
  }

  function clearRemoteMeta() {
    _remote.value = undefined;
  }

  function setRemoteMeta(meta: WnObj) {
    _remote.value = meta;
  }

  function setOptions(opt: StdMetaStoreOptions) {
    _options = Util.jsonClone(opt);
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
  function updateMeta(meta: Vars) {
    _local.updateMeta(meta);
  }

  // function setMeta(meta: Vars) {
  //   _local.setMeta(meta);
  // }

  // function setRemoteMeta(meta: Vars) {
  //   _remote.value = Util.jsonClone(meta);
  // }

  function dropChange() {
    _local.reset();
    _content.dropLocalChange();
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

  //---------------------------------------------
  async function loadRemoteMeta(): Promise<WnObj | undefined> {
    let serverMeta: WnObj | undefined = undefined;
    // 传入就是一个对象
    if (isWnObj(_options.objPath)) {
      let obj = _options.objPath;
      if (obj.id) {
        serverMeta = await _obj.fetch(`id:${obj.id}`);
      }
      // 警告
      else {
        let msg = `refresh force need obj.id: ${JSON.stringify(obj)}`;
        await Alert(msg, { type: "danger" });
        throw msg;
      }
    }
    // 一定重新加载
    else if (_.isString(_options.objPath)) {
      serverMeta = await _obj.fetch(_options.objPath);
    }

    return serverMeta;
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
  async function refresh(options: RefreshOptions = {}) {
    // 传入就是一个对象
    if (options.reset || _.isString(_options.objPath)) {
      _remote.value = await loadRemoteMeta();
    }
    // 直接赋值
    else {
      _remote.value = Util.jsonClone(_options.objPath);
    }

    // 自动重新加载内容
    if (_remote.value && _auto_load_content.value) {
      await loadCurrentContent();
    }
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

  /*---------------------------------------------
                        
                      输出特性
      
      ---------------------------------------------*/
  return {
    // 数据模型
    _local,
    _remote,
    _content,
    _auto_load_content,
    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    ActionStatus,
    ActionBarVars,
    LoadStatus,
    CurrentContent: computed(() => _content.ContentText.value),
    MetaId,
    MetaData,
    changed,
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocalChange,
    clearRemoteMeta,
    setRemoteMeta,
    dropChange,
    updateMeta,
    //---------------------------------------------
    saveMeta,
    loadCurrentContent,
    setCurrentContent,
    saveCurrentContent,
    makeMetaDifferent,
    makeContentDifferents,
    //---------------------------------------------
    // 冲突
    //---------------------------------------------
    makeConflict,
    createConflictBy,
    applyConflicts,
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

export function useStdMetaStore(options: StdMetaStoreOptions): StdMetaStoreApi {
  return defineStdMetaStore(options);
}
