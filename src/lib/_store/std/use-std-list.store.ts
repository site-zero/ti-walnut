import {
  ComboFilterValue,
  KeepInfo,
  Match,
  TableSelectEmitInfo,
  useKeep,
  Util,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  isWnObj,
  ListItemUpdateOptions,
  LocalListEditOptions,
  QueryFilter,
  QuerySorter,
  RefreshOptions,
  SqlPagerInput,
  SqlQuery,
  updatePager,
  updatePagerTotal,
  useLocalListEdit,
  useWnObj,
  WnObj,
  WnObjQueryOptions,
} from '../../';
import { ObjContentFinger, useObjContentStore } from '../use-obj-content.store';
import { auto_create_obj } from './support/auto-create-home';

export type StdListStore = ReturnType<typeof defineStdListStore>;

export type StdListStoreOptions = LocalListEditOptions & {
  /**
   * 主目录路径，通常就是一个文件夹，如果是 thing 文件夹，
   * 那么，除了生米这个参数，还需要声明 indexPath='index'
   */
  homePath: string;
  /**
   * 数据对象存储的位置，如果未指定，则采用与 homePath 相同的路径
   */
  indexPath?: string;
  /**
   * 指定一个本数据集，专有的数据附件存储目录
   * 如果指定了，那么会根据这个路径也暴露出一个 `StdListStore`
   */
  dataPath?: string;

  /**
   * 如果指定了这个选项，当 homePath 不存在的时候，就自动创建它
   */
  autoCreateHome?: boolean;
  /**
   * 本地状态保持的配置
   */
  keepQuery?: KeepInfo;
  keepSelect?: KeepInfo;
  /**
   * 固定过滤条件
   */
  fixedMatch?: QueryFilter | (() => QueryFilter);
  /**
   * 默认查询条件
   */
  query?: SqlQuery | (() => SqlQuery);
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

function defineStdListStore(options?: StdListStoreOptions) {
  //console.warn('defineStdListStore', options);
  //---------------------------------------------
  // 准备数据访问模型
  let _options: StdListStoreOptions = _.cloneDeep(options ?? { homePath: '~' });
  let _keep_query_by = ref(options?.keepQuery);
  let _keep_select_by = ref(options?.keepSelect);
  const _obj = useWnObj();
  const _home_obj = ref<WnObj>();
  const _dir_index = ref<WnObj>();
  const _dir_data = ref<WnObj>();
  //---------------------------------------------
  // 本地状态数据
  const _keep_query = computed(() => useKeep(_keep_query_by.value));
  const _keep_select = computed(() => useKeep(_keep_select_by.value));
  /**
   * 开启这个选项，如果选择的当前对象是一个文件，那么就自动加载内容
   */
  const _auto_load_content = ref<boolean>(false);
  //---------------------------------------------
  //              固定查询条件
  //---------------------------------------------
  function __create_fixed_match(): QueryFilter {
    if (_.isFunction(_options.fixedMatch)) {
      return _options.fixedMatch();
    }
    if (_options.fixedMatch) {
      return _.cloneDeep(_options.fixedMatch);
    }
    return {};
  }
  //---------------------------------------------
  //              默认查询条件
  //---------------------------------------------
  function __create_data_query(): SqlQuery {
    let re: SqlQuery = {
      filter: {},
      sorter: {},
      pager: { pageNumber: 1, pageSize: 50 },
    };
    if (_.isFunction(_options.query)) {
      let q = _options.query();
      _.assign(re, q);
    } else {
      _.assign(re, _options.query);
    }
    // 最后处理一下本地数据
    let local = _keep_query.value.loadObj();
    _.assign(re, local);
    // 搞定
    return re;
  }
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const _remote = ref<WnObj[]>();
  const _action_status = ref<DataStoreActionStatus>();
  const _query = ref(__create_data_query());
  const _current_id = ref<string>();
  const _checked_ids = ref<string[]>([]);
  const _content = useObjContentStore();
  //---------------------------------------------
  let selection = _keep_select.value.loadObj() ?? {};
  _current_id.value = selection.currentId;
  _checked_ids.value = selection.checkedIds || [];
  //---------------------------------------------
  function __save_local_query() {
    _keep_query.value.save({
      filter: _query.value.filter,
      sorter: _query.value.sorter,
      pager: {
        pageSize: _query.value.pager?.pageSize,
      },
    });
  }
  //---------------------------------------------
  function __reset_local_query() {
    _keep_query.value.remove();
  }
  //---------------------------------------------
  function __save_local_select() {
    _keep_select.value.save({
      currentId: _current_id.value,
      checkedIds: _checked_ids.value,
    });
  }
  //---------------------------------------------
  function __reset_local_select() {
    _keep_select.value.remove();
  }
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = computed(() => useLocalListEdit(_remote, _options));
  //---------------------------------------------
  const changed = computed(
    () => _local.value.isChanged() || _content.changed.value
  );
  const isEmpty = computed(() => _.isEmpty(listData.value));
  const isRemoteEmpty = computed(() => _.isEmpty(_remote.value));
  const isLocalEmpty = computed(() =>
    _.isEmpty(_local.value?.localList?.value)
  );
  //---------------------------------------------
  const ActionStatus = computed(() => _action_status.value);
  //---------------------------------------------
  const ActionBarVars = computed(() => {
    return {
      loading: _action_status.value == 'loading',
      saving: _action_status.value == 'saving',
      changed: changed.value,
      empty: isEmpty.value,
      hasCurrent: hasCurrent.value,
      hasChecked: hasChecked.value,
    } as Vars;
  });
  //---------------------------------------------
  const LoadStatus = computed((): DataStoreLoadStatus => {
    if (_.isUndefined(_remote.value)) {
      return 'unloaded';
    }
    if (_remote.value.length == _query.value.pager?.totalCount) {
      return 'full';
    }
    return 'partial';
  });

  //---------------------------------------------
  // 读写元数据
  //---------------------------------------------
  async function saveMeta() {
    let diffs = _local.value.makeDifferents();
    _action_status.value = 'saving';

    for (let diff of diffs) {
      // 修改已经存在对象
      if (diff.existsInRemote && diff.existsInLocal) {
        let obj = await _obj.update(diff.delta);
        if (obj) {
          updateItem(obj, { id: obj.id });
        }
      }
      // 插入新对象
      else if (diff.existsInLocal && !diff.existsInRemote) {
        let obj = await _obj.create(diff.delta);
        if (obj) {
          prependItem(obj);
        }
      }
      // 删除远程对象
      else if (!diff.existsInLocal && diff.existsInRemote) {
        await _obj.remove(diff.id as string);
      }
    }
    // 最后悄悄更新一下远程
    queryRemoteList();
    _action_status.value = undefined;
  }

  //---------------------------------------------
  // 读写内容
  //---------------------------------------------
  function getCurrentContentFinger(): ObjContentFinger | undefined {
    // 防空
    if (!CurrentItem.value) {
      return;
    }

    // 读取指纹
    let { id, len, sha1, mime, tp } = CurrentItem.value;
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
    if (!CurrentItem.value) {
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
    if (!CurrentItem.value) {
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
    if (_query.value.pager) {
      updatePagerTotal(_query.value.pager, 0);
    }
  }

  function setOptions(opt: StdListStoreOptions) {
    _options = _.cloneDeep(opt);
  }

  function assignOptions(opt: Partial<StdListStoreOptions>) {
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
  const listData = computed(() => {
    return _local.value.localList.value || _remote.value || [];
  });
  const hasCurrent = computed(() => !_.isNil(CurrentItem.value));
  const hasChecked = computed(
    () => _checked_ids.value && _checked_ids.value.length > 0
  );

  /**
   * 获取数据的 ID
   */
  function getItemId(it: WnObj, index: number = -1): string {
    return _local.value.getRowId(it, index) as string;
  }

  function getItemById(id?: string) {
    if (_.isNil(id)) {
      return;
    }
    let index = _local.value.getRowIndex(id);
    if (index >= 0) {
      return listData.value[index];
    }
  }

  function getItemByIndex(index: number) {
    if (index >= 0 && index < listData.value.length) {
      return listData.value[index];
    }
  }

  function getItemByMatch(match: any): WnObj | undefined {
    let am = Match.parse(match, false);
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (am.test(it)) {
        return it;
      }
    }
  }

  function getItemBy(predicate: (it: WnObj, index: number) => boolean) {
    return _.find(listData.value, predicate);
  }

  function getCurrentItem(): WnObj | undefined {
    return getItemById(_current_id.value);
  }

  function getCheckedItems(): WnObj[] {
    return findItemsById(_checked_ids.value);
  }

  function findItemsById(ids: string[]): WnObj[] {
    let indexs = ids.map((id) => _local.value.getRowIndex(id));
    let re: WnObj[] = [];
    for (let i of indexs) {
      if (i >= 0) {
        let it = listData.value[i];
        re.push(it);
      }
    }
    return re;
  }

  function findItemsByMatch(match: any): WnObj[] {
    let re: WnObj[] = [];
    let am = Match.parse(match, false);
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (am.test(it)) {
        re.push(it);
      }
    }
    return re;
  }

  function findItemsBy(
    predicate: (it: WnObj, index: number) => boolean
  ): WnObj[] {
    let re: WnObj[] = [];
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (predicate(it, i)) {
        re.push(it);
      }
    }
    return re;
  }

  function prependItem(o: WnObj) {
    // 如果存在就更新
    let id = getItemId(o);
    if (getItemById(id)) {
      updateItem(o, { id });
    }
    // 直接添加到结尾
    else {
      _local.value.prependToList(o);
    }
  }

  function appendItem(o: WnObj) {
    // 如果存在就更新
    let id = getItemId(o);
    if (getItemById(id)) {
      updateItem(o, { id });
    }
    // 直接添加到结尾
    else {
      _local.value.appendToList(o);
    }
  }

  function updateCurrent(meta: WnObj): WnObj | undefined {
    if (hasCurrent.value) {
      let uf = { id: _current_id.value };
      return _local.value.updateItem(meta, uf);
    }
  }

  function updateItem(
    meta: Vars,
    options: ListItemUpdateOptions
  ): WnObj | undefined {
    return _local.value.updateItem(meta, options);
  }

  function updateItems(meta: WnObj, forIds?: string | string[]): WnObj[] {
    return _local.value.batchUpdate(meta, forIds);
  }

  function updateChecked(meta: WnObj): WnObj[] {
    return _local.value.batchUpdate(meta, _checked_ids.value);
  }

  function removeChecked(): WnObj[] {
    if (hasChecked.value) {
      return _local.value.removeLocalItems(_checked_ids.value);
    }
    return [];
  }

  function clear() {
    _local.value.clearItems();
  }

  function removeItems(forIds?: string | string[]): WnObj[] {
    if (!_.isNil(forIds)) {
      let ids = _.concat([], forIds);
      return _local.value.removeLocalItems(ids);
    }

    return [];
  }

  async function onSelect(payload: TableSelectEmitInfo) {
    let currentId = (payload.currentId as string) ?? undefined;
    let checkedIds = Util.mapTruthyKeys(payload.checkedIds) as string[];
    await updateSelection(currentId, checkedIds);
    __save_local_select();
  }

  async function selectItem(id: string) {
    let currentId = id;
    let checkedIds = [id];
    await updateSelection(currentId, checkedIds);
    __save_local_select();
  }

  async function updateSelection(
    currentId?: string | null,
    checkedIds?: string[]
  ) {
    if (_.isEmpty(checkedIds) && !_.isNil(currentId)) {
      checkedIds = [currentId];
    }
    if (!checkedIds && currentId) {
      checkedIds = [currentId];
    }
    _current_id.value = currentId ?? undefined;
    _checked_ids.value = checkedIds ?? [];

    await __try_auto_load_content();
  }

  function cancelSelection() {
    _current_id.value = undefined;
    _checked_ids.value = [];
    __reset_local_select();
  }

  const CurrentItem = computed(() => getCurrentItem());

  function __gen_query(): SqlQuery {
    let q = _.cloneDeep(_query.value);
    q.filter = q.filter ?? {};
    _.assign(q.filter, __create_fixed_match());
    return q;
  }

  /**
   * 异步查询远程列表并更新状态。
   *
   * @param {WnObjQueryOptions} [setup={}] - 查询选项。
   * @returns {Promise<void>} - 返回一个 Promise 对象，表示查询操作的完成。
   *
   * @remarks
   * 该函数执行以下操作：
   * 1. 设置 `_action_status` 为 'loading'。
   * 2. 生成查询条件 `q`。
   * 3. 使用 `_obj.query` 方法查询远程列表和分页信息。
   * 4. 如果 `_options.patchRemote` 存在，则对查询结果进行处理。
   * 5. 更新 `remoteList` 为查询结果。
   * 6. 如果查询包含分页信息，则更新分页信息。
   * 7. 将 `_action_status` 重置为 `undefined`。
   */
  async function queryRemoteList(setup: WnObjQueryOptions = {}): Promise<void> {
    _action_status.value = 'loading';
    // 准备查询条件
    let q = __gen_query();
    //console.log('queryRemoteList', q);
    let oDir = _dir_index.value ?? _home_obj.value;

    // 防空，如果未找到主目录对象，就直接清空数据
    if (!oDir) {
      _remote.value = [];
      if (_query.value.pager) {
        updatePager(_query.value.pager, { pageNumber: 0, totalCount: 0 });
      }
      return;
    }
    let [list, pager] = await _obj.query(oDir, q, setup);

    // 后续处理
    if (_options.patchRemote) {
      let list2 = [] as WnObj[];
      for (let i = 0; i < list.length; i++) {
        let li = _.cloneDeep(list[i]);
        let li2 = _options.patchRemote(li, i);
        if (li2) {
          list2.push(li2);
        }
      }
      list = list2;
    }

    // 更新结果集
    _remote.value = list ?? [];

    // 更新翻页信息
    if (_query.value.pager) {
      updatePager(_query.value.pager, pager);
    }

    _action_status.value = undefined;
  }

  /**
   * 创建一个新的 WnObj 对象，并将其添加到本地和远程列表中。
   *
   * @param {WnObj} meta - 要创建的对象的元数据。
   * @returns {Promise<WnObj | undefined>} 返回创建的对象，如果创建失败则返回 undefined。
   * @throws 如果没有父 ID，则抛出错误。
   */
  async function create(
    meta: WnObj,
    autoAppend: 'append' | 'prepend' | 'none' = 'prepend'
  ): Promise<WnObj | undefined> {
    meta.pid = _dir_index.value?.id;
    if (!meta.pid) {
      throw 'create need parent id';
    }
    let re = await _obj.create(meta);
    if (isWnObj(re)) {
      if ('append' == autoAppend) {
        _local.value.appendToList(re);
        _remote.value?.push(re);
      } else if ('prepend' == autoAppend) {
        _local.value.prependToList(re);
        _remote.value?.unshift(re);
      }
    }
    return re;
  }

  //---------------------------------------------
  // 初始化本地数据
  //---------------------------------------------
  async function init(options?: StdListStoreOptions) {
    if (options) {
      setOptions(options);
    }
    // 读取主目录
    await reloadHome();

    // 读取数据
    await reload();
  }

  /**
   * 重新加载主页数据。
   *
   * @async
   * @function reloadHome
   * @throws {Error} 如果 homePath 未找到。
   *
   * @description
   * 该函数用于重新加载主页数据。它首先从指定路径读取主页对象，如果对象不存在且允许自动创建，则会自动创建该对象。
   * 然后，它会初始化索引路径和数据路径。
   *
   * @returns {Promise<void>} 无返回值。
   */
  async function reloadHome() {
    let { homePath, autoCreateHome, indexPath, dataPath } = _options;
    // 读取 home Obj
    let oHome = await _obj.fetch(homePath);

    // 防空:自动创建
    if (!oHome) {
      if (autoCreateHome) {
        oHome = await auto_create_obj(homePath);
      }
    }
    // 再次防空
    if (!oHome) {
      throw `homePath not found: ${homePath}`;
    }
    _home_obj.value = oHome;

    // init index path
    if (indexPath) {
      let aph = Util.appendPath(`id:${oHome.id}`, indexPath);
      _dir_index.value = await _obj.fetch(aph);
    } else {
      _dir_index.value = oHome;
    }

    // init data path
    if (dataPath) {
      let aph = Util.appendPath(`id:${oHome.id}`, dataPath);
      _dir_data.value = await _obj.fetch(aph);
    }

    // 根据 home 重新评估一下 options
    let exCtx = { HomeId: _home_obj.value.id, HomeObj: _home_obj.value };
    _keep_query_by.value = Util.explainObj(exCtx, _options.keepQuery);
    _keep_select_by.value = Util.explainObj(exCtx, _options.keepSelect);

    // 重新加载查询条件
    _query.value = __create_data_query();

    // 重新加载选中项目
    let selection = _keep_select.value.loadObj() ?? {};
    _current_id.value = selection.currentId;
    _checked_ids.value = selection.checkedIds || [];
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
    await reloadHome();
    //remoteList.value = undefined;
    await queryRemoteList();
  }

  /**
   * 刷新函数，根据提供的选项执行刷新操作。
   */
  async function refresh(options: RefreshOptions = {}) {
    if (options.reset) {
      resetLocalChange();
    }
    await queryRemoteList();
  }

  /*---------------------------------------------
                      
                    输出特性
    
    ---------------------------------------------*/
  return {
    // 数据模型
    _keep_query_by,
    _keep_select_by,
    _keep_query,
    _keep_select,
    _local,
    _remote,
    _content,
    currentId: _current_id,
    checkedIds: _checked_ids,
    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    query: computed(() => _query.value),
    HomeObj: computed(() => _home_obj.value),
    remoteList: computed(() => _remote.value),
    ActionStatus,
    ActionBarVars,
    LoadStatus,
    listData,
    hasCurrent,
    hasChecked,
    changed,
    isEmpty,
    isRemoteEmpty,
    isLocalEmpty,
    CurrentItem,
    CurrentContent: computed(() => _content.ContentText.value),
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    //isChanged: () => _local.value.isChanged(),
    getItemId,
    getItemById,
    getItemByIndex,
    getItemByMatch,
    getItemBy,
    getCurrentItem,
    getCheckedItems,
    findItemsById,
    findItemsByMatch,
    findItemsBy,
    getFilterField: (key: string, dft?: any) => {
      return _.get(_query.value.filter, key) ?? dft;
    },
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocalChange,
    clearRemoteList,

    setQuery(q: ComboFilterValue) {
      _.assign(_query.value, q);
      __save_local_query();
    },

    setFilter(filter: QueryFilter) {
      _query.value.filter = _.cloneDeep(filter);
      __save_local_query();
    },

    setSorter(sorter: QuerySorter) {
      _query.value.sorter = _.cloneDeep(sorter);
      __save_local_query();
    },

    setPager(page: Partial<SqlPagerInput>) {
      if (!_query.value.pager) {
        _query.value.pager = {
          pageNumber: 1,
          pageSize: 20,
        };
      }
      updatePager(_query.value.pager, page);
      __save_local_query();
    },

    addLocalItem(meta: WnObj) {
      _local.value.appendToList(meta);
    },

    appendItem,
    prependItem,

    updateCurrent,
    updateItem,
    updateItems,
    updateChecked,

    removeChecked,
    removeItems,
    clear,
    updateSelection,
    cancelSelection,
    //---------------------------------------------
    // 修改元数据
    //---------------------------------------------
    saveMeta,
    //---------------------------------------------
    // 读写内容
    //---------------------------------------------
    loadCurrentContent,
    setCurrentContent,
    saveCurrentContent,
    //---------------------------------------------
    // 本地化存储状态
    //---------------------------------------------
    saveLocalQuery: __save_local_query,
    resetLocalQuery: __reset_local_query,
    saveLocalSelect: __save_local_select,
    resetLocalSelect: __reset_local_select,
    setAutoLoadContent,
    assignOptions,
    setOptions,
    //---------------------------------------------
    //                  与控件绑定
    //---------------------------------------------
    onSelect,
    selectItem,
    //---------------------------------------------
    //                  远程方法
    //---------------------------------------------
    queryRemoteList,
    create,
    init,
    reload,
    refresh,
  };
}

/**
 * 维持全局单例
 */
//const _stores = new Map<string, DataListStoreFeature>();

export function useStdListStore(options?: StdListStoreOptions): StdListStore {
  return defineStdListStore(options);
}
