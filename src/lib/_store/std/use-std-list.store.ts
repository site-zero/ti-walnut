import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  getObjContentFinger,
  GlobalStatusApi,
  isObjContentEditable,
  isWnObj,
  ListStoreConflicts,
  LocalListEditSetup,
  LocalListUpdateItemOptions,
  parseObjId,
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
  WnObjContentFinger,
  WnObjQueryOptions,
} from "@site0/ti-walnut";
import {
  Alert,
  apply_conflict_list,
  buildConflictList,
  BuildConflictListOptions,
  buildDifferentListItems,
  ComboFilterValue,
  KeepInfo,
  Match,
  Pager,
  TableRowID,
  TableSelectEmitInfo,
  useKeep,
  Util,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { computed, ref, watch } from "vue";
import { useObjContentStore } from "../use-obj-content.store";
import { useSessionStore } from "../use-session.store";
import { std_reload_home } from "./support";

export type StdListStoreApi = ReturnType<typeof defineStdListStore>;

export type StdListStoreOptions = LocalListEditSetup & {
  /**
   * 主目录路径，通常就是一个文件夹，如果是 thing 文件夹，
   * 那么，除了生米这个参数，还需要声明 indexPath='index'
   */
  homePath: string | WnObj | (() => string | WnObj);
  /**
   * 如果加载 Ancestor，可以指明截止路径
   * 默认 "~"
   */
  ancestorUntil?: string;
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
   * 如果指定了这个选项，将会生成一个 AutoMatch
   * 如果匹配了查询条件才可查询。
   * 如果不声明这个选项，则什么条件都会查询
   *
   * 它的上下文输入为整个 SqlQuery 对象
   */
  filterReady?: any;
  /**
   * 默认查询条件
   */
  query?: SqlQuery | (() => SqlQuery);

  /**
   * 对处理好的 Query 数据做进一步修改
   *
   * @param q 即将发送查询的数据
   */
  patchQuery?: (q: SqlQuery) => void;
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

  /**
   * 主目录变化时自动加载祖先列表，不包括主目录自身。
   *
   * @default true
   */
  autoLoadAncestors?: boolean;

  /**
   * 可选全局状态接口，如果指定，则在 Select 等时机会自动更新状态
   */
  globalStatus?: GlobalStatusApi;
};

function defineStdListStore(options: StdListStoreOptions) {
  const session = useSessionStore();
  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  //console.warn('defineStdListStore', options);
  let _options: StdListStoreOptions = Util.jsonClone(
    options ?? { homePath: "~" }
  );

  if (_.isNil(_options.autoRemoveItemNilValue)) {
    _options.autoRemoveItemNilValue = true;
  }

  let _keep_query_by = ref(options?.keepQuery);

  let _keep_select_by = ref(options?.keepSelect);

  const _obj = useWnObj();

  const _home_obj = ref<WnObj>();

  const _ancestors = ref<WnObj[]>([]);

  const _ancestors_home_id = ref<string>();

  let _ancestors_loading: { homeId: string; task: Promise<void> } | undefined;

  const _dir_index = ref<WnObj>();

  const _dir_data = ref<WnObj>();

  // 查询和选择的初始化依赖这两个存储接口，因此先于数据模型初始化。
  const _keep_query = computed(() => useKeep(_keep_query_by.value));

  const _keep_select = computed(() => useKeep(_keep_select_by.value));

  /**
   * 开启这个选项，如果选择的当前对象是一个文件，那么就自动加载内容
   */
  const _auto_load_content = ref<boolean>(options?.autoLoadContent ?? false);

  const _remote = ref<WnObj[]>();

  const _action_status = ref<DataStoreActionStatus>();

  const _query = ref(__create_data_query());

  const _current_id = ref<string>();

  const _checked_ids = ref<string[]>([]);

  const _content = useObjContentStore();

  let selection = _keep_select.value.loadObj() ?? {};

  _current_id.value = selection.currentId;

  _checked_ids.value = selection.checkedIds || [];

  const _local = useLocalListEdit(_remote, _options);

  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const query = computed(() => _query.value);

  const HomeObj = computed(() => _home_obj.value);

  const Ancestors = computed(() => _ancestors.value);

  const AncestorsPath = computed(() =>
    _ancestors.value.map((obj) => obj.nm).join("/")
  );

  const remoteList = computed(() => _remote.value);

  const IndexDirObj = computed(() => _dir_index.value ?? _home_obj.value);

  const IndexDirPath = computed(() => {
    if (!IndexDirObj.value) {
      return;
    }
    return `id:${IndexDirObj.value.id}`;
  });

  const changed = computed(() => _local.isChanged() || _content.changed.value);

  const isEmpty = computed(() => _.isEmpty(listData.value));

  const isRemoteEmpty = computed(() => _.isEmpty(_remote.value));

  const isLocalEmpty = computed(() => _.isEmpty(_local?.localList?.value));

  const ActionStatus = computed(() => _action_status.value);

  const ActionBarVars = computed(() => {
    return {
      loading: _action_status.value == "loading",
      saving: _action_status.value == "saving",
      deleting: _action_status.value == "deleting",
      changed: changed.value,
      empty: isEmpty.value,
      hasCurrent: hasCurrent.value,
      hasChecked: hasChecked.value,
      currentItem: CurrentItem.value,
    } as Vars;
  });

  const LoadStatus = computed((): DataStoreLoadStatus => {
    if (_.isUndefined(_remote.value)) {
      return "unloaded";
    }
    if (_remote.value.length == _query.value.pager?.totalCount) {
      return "full";
    }
    return "partial";
  });

  const CurrentObjId = computed(() => {
    if (_current_id.value) {
      return parseObjId(_current_id.value);
    }
  });

  const CurrentObjHomeId = computed(() => CurrentObjId.value?.homeId);

  const CurrentObjSelfId = computed(() => CurrentObjId.value?.selfId);

  const Pager = computed(() => _query.value.pager);

  const Filter = computed(() => _query.value.filter);

  const Sorter = computed(() => _query.value.sorter);

  const listData = computed(() => {
    return _local.localList.value || _remote.value || [];
  });

  const hasCurrent = computed(() => !_.isNil(CurrentItem.value));

  const hasChecked = computed(
    () => _checked_ids.value && _checked_ids.value.length > 0
  );

  const CurrentItem = computed(() => getCurrentItem());

  const CurrentContent = computed(() => _content.ContentText.value);

  //-----------------------------------------------------
  // 数据读取
  //-----------------------------------------------------
  function getCurrentContentFinger(): WnObjContentFinger | undefined {
    // 防空
    if (!CurrentItem.value) {
      return;
    }

    // 读取指纹
    return getObjContentFinger(CurrentItem.value);
  }

  function existsInRemote(id: string): boolean {
    return _local.existsInRemote(id);
  }

  /**
   * 获取数据的 ID
   */
  function getItemId(it: WnObj, index: number = -1): string {
    return _local.getRowId(it, index) as string;
  }

  function getItemById(id?: string) {
    if (_.isNil(id)) {
      return;
    }
    let index = _local.getRowIndex(id);
    if (index >= 0) {
      return listData.value[index];
    }
  }

  function getItemIndex(id: string | null | undefined) {
    if (_.isNil(id)) {
      return -1;
    }
    return _local.getRowIndex(id);
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
    let indexs = ids.map((id) => _local.getRowIndex(id));
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

  function getNextId(): string | undefined {
    return _local.getNextRowId(_checked_ids.value) as string;
  }

  function getNextItemId(...ids: string[]): string | undefined {
    return _local.getNextRowId(ids) as string | undefined;
  }

  //-----------------------------------------------------
  // 对象选择
  //-----------------------------------------------------
  async function selectItem(id: string | null) {
    let currentId = id;
    let checkedIds = id ? [id] : [];
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

    // 更新全局状态
    if (options.globalStatus) {
      options.globalStatus.setData({
        selectedRows: _checked_ids.value.length,
        currentObj: CurrentItem.value,
      });
    }
  }

  function cancelSelection() {
    _current_id.value = undefined;
    _checked_ids.value = [];
    __reset_local_select();
  }

  //-----------------------------------------------------
  // 事件响应
  //-----------------------------------------------------
  async function onSelect(payload: TableSelectEmitInfo) {
    let currentId = (payload.currentId as string) ?? undefined;
    let checkedIds = Util.anyToTruthyKeys(payload.checkedIds);
    await updateSelection(currentId, checkedIds);
    __save_local_select();
  }

  watch(_home_obj, async () => {
    if (_options.autoLoadAncestors ?? true) {
      await reloadAncestors();
    }
  });

  //-----------------------------------------------------
  // 数据校验
  //-----------------------------------------------------
  function makeDifferents(): Vars[] {
    let re: Vars[] = [];
    let diffs = _local.makeDifferents();
    for (let diff of diffs) {
      re.push(diff.delta);
    }
    return re;
  }

  function makeContentDifferents(): Vars[] {
    return _content.getChange();
  }

  /**
   * 解决冲突，首先将 server 数据覆盖 remote
   * 然后除了冲突的字段， local 的字段全部用 server 字段替换
   */
  function applyConflicts(cf: ListStoreConflicts) {
    // 用来保持原来的数据顺序
    let id_list = _.map(listData.value, (it) => getItemId(it) as TableRowID);

    // 处理数据冲突
    let { server, localDiff } = cf;
    _remote.value = server;
    apply_conflict_list(
      server,
      localDiff,
      (list) => {
        _local.localList.value = list;
      },
      id_list
    );
  }

  /**
   * 异步计算数据冲突项
   *
   * 该方法会从服务器拉取最新数据，然后与本地数据和当前远程数据进行比对，
   * 计算出存在冲突的数据项。
   *
   * @returns 冲突详情
   */
  async function makeConflict(
    options: BuildConflictListOptions
  ): Promise<ListStoreConflicts | undefined> {
    // 首先从服务器拉取数据，然后我们就有了三个数据版本
    let server = await loadRemoteList();
    let local = _local.localList.value;
    let remote = _remote.value;

    // 比对差异
    let myDiff = buildDifferentListItems(local, remote);
    let taDiff = buildDifferentListItems(server, remote);

    // 计算冲突
    let conflicts = buildConflictList(myDiff, taDiff, {
      getId: getItemId,
      ...options,
    });
    return {
      server,
      local,
      remote,
      localDiff: myDiff,
      remoteDiff: taDiff,
      conflicts,
    };
  }

  //-----------------------------------------------------
  // 本地状态
  //-----------------------------------------------------
  function __save_local_query() {
    _keep_query.value.save({
      filter: _query.value.filter,
      sorter: _query.value.sorter,
      pager: {
        pageSize: _query.value.pager?.pageSize,
      },
    });
  }

  function __reset_local_query() {
    _keep_query.value.remove();
    _query.value = __create_data_query();
  }

  function __save_local_select() {
    _keep_select.value.save({
      currentId: _current_id.value,
      checkedIds: _checked_ids.value,
    });
  }

  function __reset_local_select() {
    _keep_select.value.remove();
  }

  //-----------------------------------------------------
  // 查询排序
  //-----------------------------------------------------
  function __create_fixed_match(): QueryFilter {
    if (_.isFunction(_options.fixedMatch)) {
      return _options.fixedMatch();
    }
    if (_options.fixedMatch) {
      return Util.jsonClone(_options.fixedMatch);
    }
    return {};
  }

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

  function __gen_query(): SqlQuery {
    let q = Util.jsonClone(_query.value);
    q.filter = q.filter ?? {};
    _.assign(q.filter, __create_fixed_match());
    if (options.patchQuery) {
      options.patchQuery(q);
    }
    return q;
  }

  function getFilterField(key: string, dft?: any) {
    return _.get(_query.value.filter, key) ?? dft;
  }

  function _is_filter_ready(q: SqlQuery): boolean {
    if (!q || _.isEmpty(q)) return false;
    if (_.isNil(options.filterReady)) return true;
    const am = Match.parse(options.filterReady);
    return am.test(q);
  }

  function setQuery(q: ComboFilterValue) {
    _.assign(_query.value, q);
    __save_local_query();
  }

  function setFilter(filter: QueryFilter) {
    let flt = Util.filterRecordNilValue(filter);
    _query.value.filter = Util.jsonClone(flt);
    __save_local_query();
  }

  function setSorter(sorter: QuerySorter) {
    _query.value.sorter = Util.jsonClone(sorter);
    __save_local_query();
  }

  function setPager(page: Partial<SqlPagerInput>) {
    if (!_query.value.pager) {
      _query.value.pager = {
        pageNumber: 1,
        pageSize: 20,
      };
    }
    updatePager(_query.value.pager, page);
    __save_local_query();
  }

  async function applyPager(pg: Partial<SqlPagerInput>) {
    setPager(pg);
    await refresh();
  }

  async function applySorter(sorter: QuerySorter) {
    setSorter(sorter);
    await refresh();
  }

  async function applyFilter(flt: Vars) {
    setFilter(flt);
    await refresh();
  }

  async function loadRemoteList(
    setup: WnObjQueryOptions = {}
  ): Promise<[WnObj[], Pager]> {
    _action_status.value = "loading";
    try {
      // 准备查询条件
      let q = __gen_query();
      //console.log('queryRemoteList', q);
      // 没有过滤条件，就不查询数据
      if (!_is_filter_ready(q)) {
        return [[], { pageNumber: 0, pageSize: 0 }];
      }
      let oDir = IndexDirObj.value;

      // 防空，如果未找到主目录对象，就直接清空数据
      if (!oDir) {
        _remote.value = [];
        if (_query.value.pager) {
          updatePager(_query.value.pager, { pageNumber: 0, totalCount: 0 });
        }
        return [[], { pageNumber: -1, pageSize: 0 }];
      }
      let [list, pager] = await _obj.query(oDir, q, setup);

      // 后续处理
      if (_options.patchRemote) {
        let list2 = [] as WnObj[];
        for (let i = 0; i < list.length; i++) {
          let li = list[i];
          let li2 = _options.patchRemote(li, i);
          if (li2) {
            list2.push(li2);
          }
        }
        list = list2;
      }

      // 更新结果集
      return [list, pager];
    } finally {
      _action_status.value = undefined;
    }
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
    try {
      let [list, pager] = await loadRemoteList(setup);

      // 更新结果集
      _remote.value = list ?? [];

      // 更新翻页信息
      if (_query.value.pager) {
        updatePager(_query.value.pager, pager);
      }
    } catch (err) {
      console.error("Error happened when queryRemoteList:", err);
      throw err;
    }
  }

  //-----------------------------------------------------
  // 数据改动
  //-----------------------------------------------------
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

  function dropChange() {
    _local.reset();
  }

  function clearRemoteList() {
    _remote.value = undefined;
    if (_query.value.pager) {
      updatePagerTotal(_query.value.pager, 0);
    }
  }

  function setRemoteList(list: WnObj[]) {
    _remote.value = list;
  }

  function setLocalList(list: WnObj[]) {
    _local.setItems(list);
  }

  function setOptions(opt: StdListStoreOptions) {
    _options = Util.jsonClone(opt);
  }

  function assignOptions(opt: Partial<StdListStoreOptions>) {
    _.assign(_options, opt);
  }

  async function setAutoLoadContent(value: boolean) {
    _auto_load_content.value = value;
    await __try_auto_load_content();
  }

  function prependItem(o: WnObj) {
    // 如果存在就更新
    let id = getItemId(o);
    if (getItemById(id)) {
      updateItemBy(o, { id });
    }
    // 直接添加到结尾
    else {
      _local.prependToList(o);
    }
  }

  function appendItem(o: WnObj) {
    // 如果存在就更新
    let id = getItemId(o);
    if (getItemById(id)) {
      updateItemBy(o, { id });
    }
    // 直接添加到结尾
    else {
      _local.appendToList(o);
    }
  }

  function addLocalItem(meta: WnObj) {
    _local.appendToList(meta);
  }

  function prependItems(objs: WnObj[] = []) {
    if (!objs) {
      return;
    }
    for (let item of objs.reverse()) {
      prependItem(item);
    }
  }

  function appendItems(objs: WnObj[] = []) {
    if (!objs) {
      return;
    }
    for (let item of objs) {
      appendItem(item);
    }
  }

  function insertItemsBefore(items: WnObj[], atIndex: number) {
    _local.insertItemsBefore(items, atIndex);
  }

  function insertItemsAfter(items: WnObj[], atIndex: number) {
    _local.insertItemsAfter(items, atIndex);
  }

  function insertItemsBeforeId(
    items: WnObj[],
    itemId: string | undefined | null
  ) {
    let index = getItemIndex(itemId);
    _local.insertItemsBefore(items, index);
  }

  function insertItemsAfterId(
    items: WnObj[],
    itemId: string | undefined | null
  ) {
    let index = getItemIndex(itemId);
    _local.insertItemsAfter(items, index);
  }

  function updateCurrent(meta: WnObj): WnObj | undefined {
    if (hasCurrent.value) {
      let uf = { id: _current_id.value };
      return _local.updateItem(meta, uf);
    }
  }

  /**
   * 更新项目列表
   *
   * 根据提供的元数据项获取其唯一 ID，并通过本地存储更新相应项目。
   *
   * @param meta - SQL 查询结果元数据数组
   * @returns 返回成功更新的项目数组，如果输入为空则返回空数组
   */
  function updateItem(meta: Vars) {
    if (_.isEmpty(meta)) {
      return undefined;
    }
    let id = getItemId(meta);
    if (_.isNil(id)) {
      return undefined;
    }
    return _local.updateItem(meta, { id });
  }

  /**
   * 更新项目列表
   *
   * 根据提供的元数据项获取其唯一 ID，并通过本地存储更新相应项目。
   *
   * @param meta - SQL 查询结果元数据数组
   * @returns 返回成功更新的项目数组，如果输入为空则返回空数组
   */
  function updateItems(meta: Vars[]) {
    if (_.isEmpty(meta)) {
      return [];
    }
    let re: Vars[] = [];
    for (let m of meta) {
      let id = getItemId(m);
      let item = _local.updateItem(m, { id });
      if (item) {
        re.push(item);
      }
    }
    return re;
  }

  function setRemoteItemBy(meta: Vars, options: LocalListUpdateItemOptions) {
    _local.setRemoteItem(meta, options);
  }

  function updateItemBy(
    meta: Vars,
    options: LocalListUpdateItemOptions
  ): WnObj | undefined {
    return _local.updateItem(meta, options);
  }

  function updateItemsById(meta: WnObj, forIds?: string | string[]): WnObj[] {
    return _local.batchUpdate(meta, forIds);
  }

  function updateItemsBy(delta: WnObj, predicate: (it: WnObj) => boolean) {
    return _local.batchUpdateBy(delta, predicate);
  }

  function updateChecked(meta: WnObj): WnObj[] {
    return _local.batchUpdate(meta, _checked_ids.value);
  }

  function removeChecked(): WnObj[] {
    if (hasChecked.value && !_.isEmpty(_checked_ids.value)) {
      // 首先查找一下可能是否需要高亮下一个的 ID
      let nextId = _local.getNextRowId(_checked_ids.value) as string;

      _action_status.value = "deleting";
      let re = _local.removeLocalItems(_checked_ids.value);
      _action_status.value = undefined;

      // 选择下一个对象
      if (nextId) {
        selectItem(nextId);
      }
      // 没有后续可选的 id
      else {
        _current_id.value = undefined;
        _checked_ids.value = [];
      }

      return re;
    }
    return [];
  }

  function setItems(items: WnObj[]) {
    _local.setItems(items);
  }

  function clear() {
    _local.clearItems();
  }

  function removeItems(forIds?: string | string[]): WnObj[] {
    if (!_.isNil(forIds)) {
      let ids = _.concat([], forIds);
      return _local.removeLocalItems(ids);
    }

    return [];
  }

  function removeItemsBy(
    filter: (item: WnObj, index: number) => boolean
  ): WnObj[] {
    return _local.removeLocalItemsBy(filter);
  }

  function removeRemoteItems(forIds?: string | string[]): WnObj[] {
    return _local.removeRemoteItems(forIds as string[]);
  }

  function removeRemoteItemsBy(
    filter: (item: WnObj, index: number) => boolean
  ): WnObj[] {
    return _local.removeRemoteItemsBy(filter);
  }

  //-----------------------------------------------------
  // 远程操作
  //-----------------------------------------------------
  async function saveMeta() {
    let diffs = _local.makeDifferents();
    if (diffs.length > 0) {
      _action_status.value = "saving";
      for (let diff of diffs) {
        // 修改已经存在对象
        if (diff.existsInTarget && diff.existsInMine) {
          let obj = await _obj.update(diff.delta);
          if (obj) {
            setRemoteItemBy(obj, { id: obj.id });
          }
        }
        // 插入新对象
        else if (diff.existsInMine && !diff.existsInTarget) {
          let obj = await _obj.create(diff.delta);
          if (obj) {
            prependItem(obj);
          }
        }
        // 删除远程对象
        else if (!diff.existsInMine && diff.existsInTarget) {
          await _obj.removeById(diff.id as string);
        }
      }
      _action_status.value = undefined;
    }
    // 最后悄悄更新一下远程
    if (options.refreshWhenSave) {
      await queryRemoteList();
    }
    _action_status.value = undefined;
  }

  async function saveChange(options: Vars = {}) {
    const { force = false } = options;
    // 自动检测改动
    if (!changed.value && !force) {
      return;
    }
    // 保存元数据
    await saveMeta();

    // 保存内容
    await saveCurrentContent({ force });
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
    // 防空
    if (!CurrentItem.value) {
      return;
    }

    // 读取指纹
    let finger = getCurrentContentFinger();

    // 防空
    if (!finger) {
      return;
    }

    // 看看是否可以直接读取，图片等大文件就不要读了
    if (!isObjContentEditable(CurrentItem.value)) {
      return;
    }

    // 读取内容
    _action_status.value = "loading";
    await _content.loadContent(finger);
    _action_status.value = undefined;
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
  async function saveCurrentContent({ force = false } = {}) {
    // 防空
    if (!CurrentItem.value) {
      return;
    }
    // 保存内容
    _action_status.value = "saving";
    let newObj = await _content.saveChange({ force });
    if (newObj) {
      let index = _local.getRowIndex(newObj.id);
      if (index >= 0) {
        _local.updateItem(newObj, { id: newObj.id });
        let index = _local.getRowIndex(newObj.id);
        if (index >= 0 && _remote.value) {
          _remote.value[index] = newObj;
        }
      }
    }
    _action_status.value = undefined;
  }

  async function __try_auto_load_content() {
    if (_auto_load_content.value) {
      let finger = getCurrentContentFinger();
      if (finger && !_content.isSameFinger(finger)) {
        await loadCurrentContent();
      }
    }
  }

  /**
   * 创建一个新的 WnObj 对象，并将其添加到本地和远程列表中。
   *
   * @param {WnObj} meta - 要创建的对象的元数据。
   * @returns {Promise<WnObj | undefined>} 返回创建的对象，如果创建失败则返回 undefined。
   * @throws 如果没有父 ID，则抛出错误。
   */
  async function create(meta: WnObj): Promise<WnObj | undefined> {
    meta.pid = _dir_index.value?.id;
    if (!meta.pid) {
      if (!_home_obj.value) {
        throw `无法创建对象，因为没有找到主目录对象`;
      }
      meta.pid = _home_obj.value?.id;
    }
    let re = await _obj.create(meta);
    if (isWnObj(re)) {
      await queryRemoteList();
      dropChange();
      await selectItem(re.id);
    }
    return re;
  }

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
   * 加载主目录的祖先列表（包含主目录自身），并更新 Ancestors。
   *
   * 无主目录 ID 时清空列表；显式 ancestorUntil 与主目录路径经 session
   * 判定相同时，直接使用 [HomeObj]，即使强制加载也不发起查询。
   * 其他情况查询至 ancestorUntil（默认 "~"），按主目录 ID 缓存结果，
   * 非强制加载时复用进行中的请求或跳过已加载结果。
   * 目录切换、强制重载或命中路径短路后，旧请求不会覆盖新结果。
   *
   * @param force 是否跳过缓存并发起新请求，默认为 false。
   * @returns 等待加载完成的 Promise，不返回列表；结果通过 Ancestors 读取。
   * @throws 路径比较或祖先查询失败时向调用方传播错误，查询失败后可重试。
   */
  async function reloadAncestors(force: boolean = false): Promise<void> {
    const homeId = _home_obj.value?.id;
    // 防空处理，如果没有主页 ID，则直接清空祖先列表并返回。
    if (!homeId) {
      _ancestors.value = [];
      _ancestors_home_id.value = undefined;
      _ancestors_loading = undefined;
      return;
    }
    const home = _home_obj.value;

    // 如果当前 HOME 就是顶级路径，那么就不加载了，直接用即可
    if (
      _options.ancestorUntil &&
      home?.ph &&
      session.isSamePath(_options.ancestorUntil, home?.ph)
    ) {
      _ancestors.value = [home];
      _ancestors_home_id.value = homeId;
      _ancestors_loading = undefined;
      return;
    }

    // 非强制加载的话，看看是否已经加载过了
    if (!force) {
      if (_ancestors_loading && _ancestors_loading.homeId === homeId) {
        // Promise<void> 虽无返回值，仍可让调用方等待已有请求并接收异常；
        // 若仅用 boolean 判断后直接返回，调用方会在加载完成前结束等待。
        return _ancestors_loading.task;
      }
      if (_ancestors_home_id.value === homeId) {
        return;
      }
    }
    // 清空数据，以便准备重新加载
    if (_ancestors_home_id.value !== homeId) {
      _ancestors.value = [];
    }
    _ancestors_home_id.value = undefined;

    // 发起获取祖先列表的异步请求
    const task = _obj
      .getAncestors(
        { includeSelft: true, until: _options.ancestorUntil || "~" },
        `id:${homeId}`
      )
      .then((ancestors) => {
        // 用 Promise 身份识别最新请求，避免目录切换或强制重载后旧结果覆盖新数据。
        if (
          _ancestors_loading?.task === task &&
          _home_obj.value?.id === homeId
        ) {
          _ancestors.value = ancestors;
          _ancestors_home_id.value = homeId;
        }
      })
      .finally(() => {
        // 旧请求完成时不能清除新请求的加载状态。
        if (_ancestors_loading?.task === task) {
          _ancestors_loading = undefined;
        }
      });

    // 设置加载标志
    _ancestors_loading = { homeId, task };
    return task;
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
    await std_reload_home({
      homePath: _options.homePath,
      indexPath: _options.indexPath,
      dataPath: _options.dataPath,
      autoCreateHome: _options.autoCreateHome,
      keepQuery: _options.keepQuery,
      keepSelect: _options.keepSelect,
      fetch: (path) => _obj.fetch(path),
      getObj: (id) => _obj.get(id),
      setHome: (obj) => {
        _home_obj.value = obj;
      },
      setIndexDir: (obj) => {
        _dir_index.value = obj;
      },
      setDataDir: (obj) => {
        _dir_data.value = obj;
      },
      setKeepQuery: (keep) => {
        _keep_query_by.value = keep;
      },
      setKeepSelect: (keep) => {
        _keep_select_by.value = keep;
      },
      createQuery: __create_data_query,
      setQuery: (q) => {
        _query.value = q;
      },
      loadSelection: () => _keep_select.value.loadObj(),
      setSelection: (currentId, checkedIds) => {
        _current_id.value = currentId;
        _checked_ids.value = checkedIds ?? [];
      },
    });
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
    dropChange();
    await reloadHome();
    //remoteList.value = undefined;
    await queryRemoteList();
  }

  /**
   * 刷新函数，根据提供的选项执行刷新操作。
   */
  async function refresh(options: RefreshOptions = {}) {
    if (options.reset) {
      dropChange();
    }
    await queryRemoteList();

    // 自动重新加载内容
    if (hasCurrent.value && _auto_load_content.value) {
      await loadCurrentContent();
    }
  }

  async function openDir(path: string) {
    let newDir = await _obj.fetch(path);
    if (newDir) {
      _dir_index.value = newDir;
      await queryRemoteList();
    }
    // 报错
    else {
      await Alert(`目录不存在：${path}`, { type: "warn" });
    }
  }

  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    // 数据模型
    _auto_load_content,
    _keep_query_by,
    _keep_select_by,
    _local,
    _remote,
    _content,
    currentId: _current_id,
    checkedIds: _checked_ids,

    // 计算属性
    _keep_query,
    _keep_select,
    query,
    HomeObj,
    Ancestors,
    AncestorsPath,
    IndexDirObj,
    IndexDirPath,
    remoteList,
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
    CurrentContent,
    CurrentObjId,
    CurrentObjHomeId,
    CurrentObjSelfId,
    Pager,
    Filter,
    Sorter,

    // 数据读取
    existsInRemote,
    getItemId,
    getItemIndex,
    getItemById,
    getItemByIndex,
    getItemByMatch,
    getItemBy,
    getCurrentItem,
    getCheckedItems,
    findItemsById,
    findItemsByMatch,
    findItemsBy,
    getNextId,
    getNextItemId,

    // 对象选择
    updateSelection,
    cancelSelection,
    selectItem,

    // 事件响应
    onSelect,

    // 数据校验
    makeDifferents,
    makeContentDifferents,
    applyConflicts,
    makeConflict,

    // 本地状态
    saveLocalQuery: __save_local_query,
    resetLocalQuery: __reset_local_query,
    saveLocalSelect: __save_local_select,
    resetLocalSelect: __reset_local_select,

    // 查询排序
    getFilterField,
    setQuery,
    setFilter,
    setSorter,
    setPager,
    applyPager,
    applyFilter,
    applySorter,
    queryRemoteList,

    // 数据改动
    dropChange,
    clearRemoteList,
    setRemoteList,
    setLocalList,
    addLocalItem,
    appendItem,
    prependItem,
    appendItems,
    prependItems,
    setRemoteItemBy,
    insertItemsBefore,
    insertItemsAfter,
    insertItemsBeforeId,
    insertItemsAfterId,
    updateCurrent,
    updateItem,
    updateItems,
    updateItemBy,
    updateItemsById,
    updateItemsBy,
    updateChecked,
    removeChecked,
    removeItems,
    removeItemsBy,
    removeRemoteItems,
    removeRemoteItemsBy,
    setItems,
    clear,
    setCurrentContent,
    setAutoLoadContent,
    assignOptions,
    setOptions,

    // 远程操作
    saveMeta,
    saveChange,
    loadCurrentContent,
    saveCurrentContent,
    reloadAncestors,
    create,
    init,
    reload,
    refresh,
    openDir,
  };
}

/**
 * 维持全局单例
 */
//const _stores = new Map<string, DataListStoreFeature>();

export function useStdListStore(options: StdListStoreOptions): StdListStoreApi {
  return defineStdListStore(options);
}
