import { Alert, Confirm, Prompt, Util } from '@site0/tijs';
import _ from 'lodash';
import {
  DirInnerContext3,
  DirOperatingFeature,
  RemoveOptions,
  useWnObj,
  WnObj,
} from '../../../..';

export function userDirOperating(
  context: DirInnerContext3
): DirOperatingFeature {
  let { _dir, _query, _selection, _selecting } = context;
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
  async function removeChecked(options?: RemoveOptions) {
    // 防空
    let ckIds = Util.recordTruthyKeys(_selection.checkedIds.value);
    if (!ckIds || _.isEmpty(ckIds)) {
      Alert('i18n:remove-nil', { type: 'info' });
      return;
    }

    // 主动确认
    if (options) {
      let confirm = _.assign({
        message: 'i18n:remove-confirm-hard',
        title: 'i18n:remove',
        icon: 'fas-trash',
        vars: { N: ckIds.length },
        bodyIcon: 'fas-circle-radiation',
        iconOk: 'fas-trash',
        textOk: 'i18n:remove-now',
        type: 'warn',
        textCancel: 'i18n:cancel',
        ...options,
      } as RemoveOptions);

      if (!(await Confirm(confirm.message!, confirm))) {
        return;
      }
    }

    // 执行删除
    let _obj = useWnObj(`id:${_dir.homeIndexId.value}`);
    await _obj.remove(...ckIds);
    await _query.queryList();
    _selecting.clearSelection();
  }

  //---------------------------------------------
  async function renameCurrent() {
    let obj = _selecting.currentMeta.value;
    if (!obj) {
      await Alert('i18n:nil-item', { type: 'warn' });
      return;
    }
    let nm = obj.nm;
    nm = await Prompt('Pleae enter the FILE new name:', {
      type: 'info',
      width: '80%',
      maxWidth: '1000px',
      placeholder: 'New File Name',
      value: nm,
    });
    let newName = _.trim(nm);
    // 用户取消
    if (!newName) {
      return;
    }
    // 创建
    let _obj = useWnObj();
    let meta = await _obj.rename({ id: obj.id }, newName);
    if (meta) {
      _query.updateListItem(meta);
      _selecting.updateSelection(meta.id);
      return meta;
    }
    // 创建失败打印一下警告
    else {
      console.warn('Fail to rename obj:', newName);
    }
  }

  //---------------------------------------------
  // 输出特性
  //---------------------------------------------
  return {
    createFile,
    createDir,
    removeChecked,
    renameCurrent,
  };
}
