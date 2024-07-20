import { DirGUIContext, DirInnerContext2 } from './dir.type';

export function createDirGuiContext(context: DirInnerContext2): DirGUIContext {
  let {
    _vars,
    _dir,
    _view,
    _query,
    _agg,
    _meta,
    _content,
    _selection,
    _action_status,
  } = context;

  return {
    moduleName: _dir.moduleName.value,
    oHome: _dir.oHome.value,
    oHomeIndex: _dir.oHomeIndex.value,
    //............ GUI Loading Path
    actionsPath: _dir.actionPath.value,
    layoutPath: _dir.layoutPath.value,
    schemaPath: _dir.schemaPath.value,
    methodPaths: _dir.methodPaths.value,
    //........... DirInitGetters
    homeId: _dir.homeId.value,
    homeIndexId: _dir.homeIndexId.value,
    isHomeExists: _dir.isHomeExists.value,
    actions: _view.actions.value,
    actionStatus: _action_status.value,
    //........... DirQuerySettings
    fixedMatch: _query.fixedMatch.value,
    filter: _query.filter.value,
    sorter: _query.sorter.value,
    objKeys: _query.objKeys.value,
    joinOne: _query.joinOne.value,
    pager: _query.pager.value,
    //........... DirQueryGetters
    queryPageNumber: _query.queryPageNumber.value,
    queryPageSize: _query.queryPageSize.value,
    isLongPager: _query.isLongPager.value,
    isShortPager: _query.isShortPager.value,
    isPagerEnabled: _query.isPagerEnabled.value,
    //........... DirSelection
    currentId: _selection.currentId.value,
    checkedIds: _selection.checkedIds.value,
    list: _query.list.value,
    itemStatus: _query.itemStatus.value,
    //........... DirAggFeature
    aggQuery: _agg.aggQuery.value,
    aggSet: _agg.aggSet.value,
    aggAutoReload: _agg.aggAutoReload.value,
    aggResult: _agg.aggResult.value,
    //........... ObjEditState
    meta: _meta.metaData.value,
    contentText: _content.contentText.value,
    contentType: _content.contentType.value,
    contentMime: _content.contentMime.value,
    contentStatus: _content.status.value,
    fieldStatus: _meta.status.value,
    vars: _vars.value,
  };
}
