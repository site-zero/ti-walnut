import { DirGUIContext, DirInnerContext2 } from './dir.type';

export function createDirGuiContext(context: DirInnerContext2): DirGUIContext {
  let { _dir, _query, _agg, _meta } = context;
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
    currentId: _query.currentId.value,
    checkedIds: _query.checkedIds.value,
    list: _query.list.value,
    itemStatus: _query.itemStatus.value,
    //........... DirAggFeature
    aggQuery: _agg.aggQuery.value,
    aggSet: _agg.aggSet.value,
    aggAutoReload: _agg.aggAutoReload.value,
    aggResult: _agg.aggResult.value,
    //........... ObjEditState
    meta: _meta.value.metaData.value,
    // content: _edit.content.value,
    // savedContent: _edit.savedContent.value,
    // contentPath: _edit.contentPath.value,
    // contentType: _edit.contentType.value,
    // contentData: _edit.contentData.value,
    fieldStatus: _meta.value.status.value,
  };
}
