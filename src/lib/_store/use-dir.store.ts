import { Util, Vars, getLogger } from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import {
  DirFeature,
  DirInnerContext,
  DirInnerContext2,
  DirInnerContext3,
  DirSelection,
} from './dir/dir.type';
import { userDirGUI } from './dir/use-dir--gui';
import { userDirInvoking } from './dir/use-dir--invoking';
import { userDirOperating } from './dir/use-dir--operating';
import { userDirReloading } from './dir/use-dir--reload';
import { useDirSaving } from './dir/use-dir--saving';
import { userDirSelecting } from './dir/use-dir--selecting';
import { userDirAgg } from './dir/use-dir-agg';
import { userDirEditing } from './dir/use-dir-editing';
import { useDirInit } from './dir/use-dir-init';
import { useDirKeep } from './dir/use-dir-keep';
import { userDirQuery } from './dir/use-dir-query';
import { useDirView } from './dir/use-dir-view';
import { useObjContentStore } from './use-obj-content.store';
import { useObjMetaStore } from './use-obj-meta.store';
//-----------------------------------------------
export * from './dir/dir.type';
//-----------------------------------------------
const log = getLogger('wn.store.dir');
//-----------------------------------------------
export function defineDirStore(name?: string): DirFeature {
  name = name || 'CurrentDir';
  log.debug(`defineDirStore(${name || ''})`);
  //---------------------------------------------
  log.info(`create new DirStore(${name})`);
  //---------------------------------------------
  // 定义新实例
  const _dir = useDirInit();
  //---------------------------------------------
  const _view = useDirView(_dir);
  const _query = userDirQuery(_dir);
  //---------------------------------------------
  const _selection: DirSelection = {
    currentId: ref<string>(),
    checkedIds: ref<Record<string, boolean>>({}),
  };

  //---------------------------------------------
  const _agg = userDirAgg({
    ..._dir,
    ..._query,
  });
  //---------------------------------------------
  const _inner_context: DirInnerContext = {
    _dir,
    _query,
    _agg,
    _view,
    _selection,
  };
  //---------------------------------------------
  const _saving = computed(() => useDirSaving(_inner_context));
  //---------------------------------------------
  const _meta = computed(() => useObjMetaStore({ saving: _saving.value }));
  const _content = computed(() => useObjContentStore());
  //---------------------------------------------
  const _inner_context2: DirInnerContext2 = {
    ..._inner_context,
    _meta,
    _content,
  };
  //---------------------------------------------
  const _gui = userDirGUI(_inner_context2);
  //---------------------------------------------
  const _keep = computed(() => {
    let context = _gui.GUIContext.value;
    let behaviors = Util.explainObj(context, _dir.behaviors.value);
    return useDirKeep(behaviors);
  });
  //---------------------------------------------
  const _editing = userDirEditing(_inner_context2);
  const _selecting = userDirSelecting(_inner_context2, _keep, _editing);
  const _reloading = userDirReloading(
    _inner_context2,
    _keep,
    _selecting,
    _editing
  );
  //---------------------------------------------
  const actionStatus = computed(() => {
    return {
      hasCurrent: !_.isNil(_selection.currentId.value),
      hasChecked: !_.isEmpty(
        Util.recordTruthyKeys(_selection.checkedIds.value)
      ),
      metaChanged: _meta.value.changed.value,
      contentChanged: _content.value.changed.value,
      listRefreshing: _query.queryLoading.value,
      contentLoading: _content.value.status.value == 'loading',
      contentSaving: _content.value.status.value == 'saving',
    } as Vars;
  });
  //---------------------------------------------
  const _inner_context3: DirInnerContext3 = {
    ..._inner_context2,
    _gui,
    _keep,
    _selecting,
    _editing,
    _reloading,
  };
  //---------------------------------------------
  const _operating = userDirOperating(_inner_context3);
  //---------------------------------------------
  // 输出特性
  //---------------------------------------------
  let re: DirFeature = {
    /*------------<expose>--------------*/
    _keep,
    _meta,
    _content,
    actionStatus,
    getCurrentMeta: () => {
      if (_selection.currentId.value) {
        return _.cloneDeep(_meta.value.metaData.value);
      }
    },
    /*-------------<State>---------------*/
    ..._dir,
    ..._query,
    ..._agg,
    ..._view,
    ..._gui,
    ..._selection,
    /*------------<Methods>--------------*/
    ..._selecting,
    ..._reloading,
    ..._editing,
    ..._operating,
    /*----------<Later Assign>-----------*/
    invoke: async (_methodName: string, _payload?: any): Promise<any> => {
      throw 'I am just dirInvoking placeholder!';
    },
  };
  //---------------------------------------------
  re.invoke = userDirInvoking(re);
  //---------------------------------------------
  return re;
}

export function useDirStore(name?: string): DirFeature {
  return defineDirStore(name);
}
