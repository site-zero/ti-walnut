import { Util } from '@site0/tijs';
import _ from 'lodash';
import { computed } from 'vue';
import { createDirGuiContext } from './dir-gui-context';
import { DirGUIContext, DirGUIFeature, DirInnerContext2 } from './dir.type';

export function userDirGUI(context: DirInnerContext2): DirGUIFeature {
  let { _view } = context;

  //---------------------------------------------
  const GUIContext = computed(() => {
    return getGuiContext();
  });

  function getGuiContext(): DirGUIContext {
    return createDirGuiContext(context);
  }

  function explainLayout() {
    let layout = _.cloneDeep(_view.layout.value);
    let context = _.cloneDeep(GUIContext.value);
    let layout2 = Util.explainObj(context, layout);
    // console.log('layout', layout2);
    return layout2;
  }

  function explainSchema() {
    let schema = _.cloneDeep(_view.schema.value);
    let context = _.cloneDeep(GUIContext.value);
    let schema2 = Util.explainObj(context, schema);
    // console.log('schema', schema2);
    return schema2;
  }

  return {
    GUIContext,
    explainLayout,
    explainSchema,
  };
}
