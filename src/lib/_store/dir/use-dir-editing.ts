import { Vars } from '@site0/tijs';
import { ref } from 'vue';
import { DirEditingFeature, DirInnerContext2 } from './dir.type';

export function userDirEditing(context: DirInnerContext2): DirEditingFeature {
  let { _query, _meta, _content } = context;
  const guiNeedContent = ref(false);
  //---------------------------------------------
  function updateMeta(meta: Vars) {
    _meta.updateMeta(meta);
    _query.updateListItem(_meta.metaData);
  }
  //---------------------------------------------
  function setContent(str: string) {
    _content.setContent(str);
  }
  //---------------------------------------------
  function dropChange() {
    _meta.dropLocalChange();
    _content.dropLocalChange();
  }

  //---------------------------------------------
  async function saveMeta() {
    let re = await _meta.saveChange();
    if (re) {
      _query.updateListItem(re);
    }
  }
  //---------------------------------------------
  async function saveContent() {
    // 防守： 界面无需内容
    let re = await _content.saveChange();
    console.log(re);
    if (re) {
      _meta.initMeta(re);
      _query.updateListItem(re);
    }
  }
  //---------------------------------------------
  async function saveMetaAndContent() {
    await Promise.all([saveMeta(), saveContent()]);
  }
  //---------------------------------------------
  async function updateAndSave(meta: Vars): Promise<void> {
    _meta.updateMeta(meta);
    await _meta.saveChange();
    _query.updateListItem(_meta.metaData.value);
  }
  //---------------------------------------------
  async function create(meta: Vars): Promise<void> {
    _meta.initMeta();
    _meta.updateMeta(meta);
    await _meta.saveChange();
    _query.prependList(_meta.metaData.value);
  }
  //---------------------------------------------
  async function autoLoadContent() {
    // 防守： 界面无需内容
    if (!guiNeedContent.value) {
      _content.reset();
      return;
    }
    //console.log('enter>>>>> autoLoadContent');
    // 防守： 只有文件才需要读取
    if (!_meta.isFILE.value) {
      return;
    }
    // 根据指纹判断是否需要读取
    let finger = _meta.metaFinger.value;
    if (finger) {
      let c = _content;
      if (c.status.value == 'empty' || !c.isSameFinger(finger)) {
        // console.log('=============> load', finger);
        await c.loadContent(finger);
      }
    }
  }

  //---------------------------------------------
  return {
    guiNeedContent,
    updateMeta,
    setContent,
    dropChange,
    saveMeta,
    saveContent,
    saveMetaAndContent,
    updateAndSave,
    create,
    autoLoadContent,
  };
}
