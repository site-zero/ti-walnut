import { WnObj } from '../..';
import { computed, ref } from 'vue';
import _ from 'lodash';
import { getLogger } from '@site0/tijs';

const log = getLogger('wn.store.dir.setup');

export function useDirSetup() {
  log.debug('useDirSetup')
  let oHome = ref<WnObj>();
  let oHomeIndex = ref<WnObj>();
  let homeId = computed(() => _.get(oHome.value, 'id'));
  let homeIndexId = computed(() => _.get(oHomeIndex.value, 'id'));
  let isHomeExists = computed(() => (homeId.value ? true : false));

  function resetGUISettings() {}

  async function loadGUISettings(obj?: WnObj) {
    oHome.value = obj;

    // Guard: oHome is Nil
    if (_.isNil(oHome.value)) {
      oHomeIndex.value = undefined;
      resetGUISettings();
      return;
    }
    // oHome is GUI View
    // oHome is FILE
    // oHome is Thing Set
    // oHome is DIR
    if ('DIR' == oHome.value.race) {
      oHomeIndex.value = oHome.value;
    }
    
  }

  return {
    oHome,
    oHomeIndex,
    homeId,
    homeIndexId,
    isHomeExists,
    loadGUISettings,
  };
}
