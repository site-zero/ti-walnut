import { Vars } from '@site0/tijs';
import { ref } from 'vue';
import { DirEditingFeature, DirInnerContext2 } from './dir.type';

export function userDirEditing(context: DirInnerContext2): DirEditingFeature {
  let { _query, _meta, _content } = context;
  const guiNeedContent = ref(false);
  //---------------------------------------------
  function updateMeta(meta: Vars) {
    _meta.value.updateMeta(meta);
    _query.updateListItem(meta);
  }
  //---------------------------------------------
  async function saveMeta(): Promise<void> {
    await _meta.value.saveChange();
    _query.updateListItem(_meta.value.metaData.value);
  }
  //---------------------------------------------
  async function updateAndSave(meta: Vars): Promise<void> {
    _meta.value.updateMeta(meta);
    await _meta.value.saveChange();
    _query.updateListItem(_meta.value.metaData.value);
  }
  //---------------------------------------------
  async function create(meta: Vars): Promise<void> {
    _meta.value.initMeta();
    _meta.value.updateMeta(meta);
    await _meta.value.saveChange();
    _query.updateListItem(_meta.value.metaData.value);
  }
  //---------------------------------------------
  async function autoLoadContent() {
    // 防守： 界面无需内容
    if (!guiNeedContent.value) {
      return;
    }
    console.log('enter>>>>> autoLoadContent');
    // 防守： 只有文件才需要读取
    if (!_meta.value.isFILE.value) {
      return;
    }
    // 根据指纹判断是否需要读取
    let finger = _meta.value.metaFinger.value;
    if (finger) {
      let c = _content.value;
      if (!c.loaded.value || !c.isSameFinger(finger)) {
        console.log('=============> load', finger);
        await c.loadContent(finger);
      }
    }
  }
  //---------------------------------------------
  return {
    guiNeedContent,
    updateMeta,
    saveMeta,
    updateAndSave,
    create,
    autoLoadContent,
  };
}
