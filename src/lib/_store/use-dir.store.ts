import { getLogger } from '@site0/tijs';
import { defineStore } from 'pinia';
import { WnObj } from '..';
import { DirFeatures, DirGUIContext } from './dir/dir.type';
import { userDirAgg } from './dir/use-dir-agg';
import { useDirInit } from './dir/use-dir-init';
import { userDirQuery } from './dir/use-dir-query';
import { useDirView } from './dir/use-dir-view';
import { useDirKeep } from './dir/use-dir-keep';
import { userObjEdit } from './edit/use-obj-edit';
import { computed } from 'vue';

const log = getLogger('wn.pinia.dir');

export function defineDirStore(name?: string) {
  log.debug(`defineDirStore(${name || ''})`);
  return defineStore(name || 'CurrentDir', (): DirFeatures => {
    log.info(`defineStore(${name || 'CurrentDir'})`);
    let _dir = useDirInit();
    let _keep = useDirKeep();
    let _view = useDirView(_dir);
    let _query = userDirQuery(_dir);
    let _agg = userDirAgg({
      ..._dir,
      ..._query,
    });
    let _edit = userObjEdit();

    function getGuiContext(): DirGUIContext {
      console.log("getGuiContext")
      return {
        moduleName: _dir.moduleName.value,
        oHome: _dir.oHome.value,
        oHomeIndex: _dir.oHomeIndex.value,
        //............ GUI Loading Path
        actionsPath: _dir.actionsPath.value,
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

    return {
      /*-----------<State>---------------*/
      ..._dir,
      ..._query,
      ..._agg,
      ..._view,
      ..._edit,
      /*-----------<Getters>---------------*/
      GUIContext: computed(() => {
        return getGuiContext();
      }),
      /*-----------<Actions>---------------*/
      keepState: () => {
        _keep.saveToLocal({
          ..._view,
          ..._query,
        });
      },
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

        _keep.restoreFromLocal({
          ..._view,
          ..._query,
        });

        await _query.queryList();
        if (_agg.aggAutoReload.value) {
          await _agg.loadAggResult();
        }
      },
    };
  });
}
