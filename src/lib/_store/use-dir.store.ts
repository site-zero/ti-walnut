import { Util, getLogger } from '@site0/tijs';
import { computed } from 'vue';
import { DirFeature, DirInnerContext, DirInnerContext2 } from './dir/dir.type';
import { userDirGUI } from './dir/use-dir--gui';
import { userDirReloading } from './dir/use-dir--reload';
import { useDirSaving } from './dir/use-dir--saving';
import { userDirSelecting } from './dir/use-dir--selection';
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
  const _agg = userDirAgg({
    ..._dir,
    ..._query,
  });
  //---------------------------------------------
  const _inner_context = {
    _dir,
    _query,
    _agg,
    _view,
  } as DirInnerContext;
  //---------------------------------------------
  const _saving = computed(() => useDirSaving(_inner_context));
  //---------------------------------------------
  const _meta = computed(() => useObjMetaStore({ saving: _saving.value }));
  const _content = computed(() => useObjContentStore());
  //---------------------------------------------
  const _inner_context2 = {
    ..._inner_context,
    _meta,
    _content,
  } as DirInnerContext2;
  //---------------------------------------------
  const _gui = userDirGUI(_inner_context2);
  //---------------------------------------------
  const _keep = computed(() => {
    let context = _gui.GUIContext.value;
    let behaviors = Util.explainObj(context, _dir.behaviors.value);
    return useDirKeep(behaviors);
  });
  //---------------------------------------------
  const _selecting = userDirSelecting(_inner_context2, _keep);
  const _editing = userDirEditing(_inner_context2);
  const _reloading = userDirReloading(
    _inner_context2,
    _keep,
    _selecting,
    _editing
  );
  //---------------------------------------------
  // 输出特性
  //---------------------------------------------
  return {
    /*------------<expose>--------------*/
    _keep,
    _meta,
    _content,
    /*-------------<State>---------------*/
    ..._dir,
    ..._query,
    ..._agg,
    ..._view,
    ..._gui,
    /*------------<Methods>--------------*/
    ..._selecting,
    ..._reloading,
    ..._editing,
  };
}

export function useDirStore(name?: string): DirFeature {
  return defineDirStore(name);
}
