import { Util, getLogger } from '@site0/tijs';
import _ from 'lodash';
import { computed } from 'vue';
import { WnObj } from '..';
import { DirFeature, DirGUIContext } from './dir/dir.type';
import { userDirAgg } from './dir/use-dir-agg';
import { useDirInit } from './dir/use-dir-init';
import { useDirKeep } from './dir/use-dir-keep';
import { userDirQuery } from './dir/use-dir-query';
import { useDirView } from './dir/use-dir-view';
import { userObjEdit } from './edit/use-obj-edit';

export * from './dir/dir.type';

const log = getLogger('wn.store.dir');

const _DIRS = new Map<string, DirFeature>();

export function useDirStore(name?: string): DirFeature {
  name = name || 'CurrentDir';
  log.debug(`defineDirStore(${name || ''})`);

  // 已经存在了实例
  let re = _DIRS.get(name);
  if (re) {
    return re;
  }

  // 定义新实例
  log.info(`create new DirStore(${name})`);
  const _dir = useDirInit();
  const _keep = computed(() => {
    let context = getGuiContext();
    let behaviors = Util.explainObj(context, _dir.behaviors.value);
    return useDirKeep(behaviors);
  });
  const _view = useDirView(_dir);
  const _query = userDirQuery(_dir);
  const _agg = userDirAgg({
    ..._dir,
    ..._query,
  });
  const _edit = userObjEdit();
  const GUIContext = computed(() => {
    return getGuiContext();
  });

  function getGuiContext(): DirGUIContext {
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
      meta: _edit.meta.value,
      content: _edit.content.value,
      savedContent: _edit.savedContent.value,
      contentPath: _edit.contentPath.value,
      contentType: _edit.contentType.value,
      contentData: _edit.contentData.value,
      fieldStatus: _edit.fieldStatus.value,
    };
  }

  function updateSelection(
    currentId?: string,
    checkedIds?: string[] | Map<string, boolean> | Record<string, boolean>
  ) {
    if (_.isEmpty(checkedIds) && !_.isNil(currentId)) {
      checkedIds = [currentId];
    }
    let ckIds: Record<string, boolean>;
    if (_.isArray(checkedIds)) {
      ckIds = Util.arrayToRecord(checkedIds);
    } else if (_.isMap(checkedIds)) {
      ckIds = Util.mapToObj(checkedIds);
    } else {
      ckIds = _.cloneDeep(checkedIds) ?? {};
    }
    _query.currentId.value = currentId;
    _query.checkedIds.value = ckIds;
    console.log(`Keep.saveSelection(${currentId}, ${ckIds});`);
    _keep.value.saveSelection(currentId, ckIds);

    let meta: WnObj | undefined = undefined;
    if (currentId) {
      meta = _.find(_query.list.value, (li) => li.id == currentId);
      _edit.meta.value = _.cloneDeep(meta);
    } else {
      _edit.meta.value = undefined;
    }
  }
  function clearSelection() {
    _query.currentId.value = undefined;
    _query.checkedIds.value = {};
  }

  re = {
    _keep,
    /*-----------<State>---------------*/
    ..._dir,
    ..._query,
    ..._agg,
    ..._view,
    ..._edit,
    /*-----------<Getters>---------------*/
    GUIContext,
    /*-----------<Methods>---------------*/
    explainLayout: () => {
      let layout = _.cloneDeep(_view.layout.value);
      let context = _.cloneDeep(GUIContext.value);
      let layout2 = Util.explainObj(context, layout);
      // console.log('layout', layout2);
      return layout2;
    },
    explainSchema: () => {
      let schema = _.cloneDeep(_view.schema.value);
      let context = _.cloneDeep(GUIContext.value);
      let schema2 = Util.explainObj(context, schema);
      // console.log('schema', schema2);
      return schema2;
    },
    keepState: () => {
      _keep.value.saveToLocal({
        ..._view,
        ..._query,
      });
    },
    updateSelection,
    clearSelection,
    reload: async (obj?: WnObj) => {
      await _dir.initDirSettings(obj);

      _view.resetView();
      _query.resetQuery();
      _agg.resetAgg();

      await _view.loadView();

      _view.applyView(_dir.behaviors.value, {
        ..._query,
        ..._agg,
      });

      await _query.queryList();

      _keep.value.restoreFromLocal(
        {
          ..._view,
          ..._query,
        },
        updateSelection
      );
      if (_agg.aggAutoReload.value) {
        await _agg.loadAggResult();
      }
    },
  } as DirFeature;

  // Save to cache
  _DIRS.set(name, re);

  // Done
  return re;
}
