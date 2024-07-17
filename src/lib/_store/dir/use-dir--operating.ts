import { Prompt, Util } from '@site0/tijs';
import _ from 'lodash';
import {
  DirInnerContext3,
  DirOperatingFeature,
  useWnObj,
  WnObj,
} from '../../../..';

export function userDirOperating(
  context: DirInnerContext3
): DirOperatingFeature {
  let { _dir, _query, _meta, _content, _selection, _selecting } = context;
  //---------------------------------------------
  async function createFile(nm?: string): Promise<WnObj | undefined> {
    nm = _.trim(nm);
    if (!nm) {
      nm = await Prompt('Pleae enter the new FILE name:', {
        type: 'info',
        width: '80%',
        maxWidth: '1000px',
        placeholder: 'New File Name',
      });
    }
    nm = _.trim(nm);
    // 用户取消
    if (!nm) {
      return;
    }
    // 创建
    let _obj = useWnObj(`id:${_dir.homeIndexId.value}`);
    let meta = await _obj.create({ nm, race: 'FILE' });
    if (meta) {
      _query.prependList(meta);
      _selecting.updateSelection(meta.id);
      return meta;
    }
    // 创建失败打印一下警告
    else {
      console.warn('Fail to create obj:', nm);
    }
  }
  //---------------------------------------------
  async function createDir(nm?: string): Promise<WnObj | undefined> {
    nm = _.trim(nm);
    if (!nm) {
      nm = await Prompt('Pleae enter the new DIR name:', {
        type: 'info',
        width: '80%',
        maxWidth: '1000px',
        placeholder: 'New Directory Name',
      });
    }
    nm = _.trim(nm);
    // 用户取消
    if (!nm) {
      return;
    }
    // 创建
    let _obj = useWnObj(`id:${_dir.homeIndexId.value}`);
    let meta = await _obj.create({ nm, race: 'DIR' });
    if (meta) {
      _query.prependList(meta);
      _selecting.updateSelection(meta.id);
      return meta;
    }
    // 创建失败打印一下警告
    else {
      console.warn('Fail to create obj:', nm);
    }
  }

  //---------------------------------------------
  async function removeChecked() {
    let ckIds = Util.recordTruthyKeys(_selection.checkedIds.value);
    if (ckIds && ckIds.length > 0) {
      let _obj = useWnObj(`id:${_dir.homeIndexId.value}`);
      await _obj.remove(...ckIds);
      await _query.queryList();
      _selecting.clearSelection();
    }
  }

  //---------------------------------------------
  // 输出特性
  //---------------------------------------------
  return {
    createFile,
    createDir,
    removeChecked,
  };
}
