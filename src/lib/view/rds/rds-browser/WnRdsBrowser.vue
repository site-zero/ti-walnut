<script lang="ts" setup>
  //--------------------------------------------------
  import { TiLayoutGrid } from '@site0/tijs';
  import { computed, inject, ref, watch } from 'vue';
  import {
    RdsBrowserApi,
    useRdsListStore,
    WN_HUB_APP_INST,
  } from '../../../../lib';
  import { useRdsBrowserLayout } from './rds-browser-layout';
  import { useRdsBrowserSchema } from './rds-browser-schema';
  import { RdsBrowserFeature, RdsBrowserProps } from './rds-browser-types';
  import { getKeepName, useRdsBrowser } from './use-rds-browser';
  //--------------------------------------------------
  const _hub = inject(WN_HUB_APP_INST);
  //--------------------------------------------------
  const props = withDefaults(defineProps<RdsBrowserProps>(), {
    layoutQuickColumns: '50% 1fr',
    defaultKeepMode: 'local',
    autoReload: true,
  });
  //--------------------------------------------------
  const _store_at = ref(0);
  //--------------------------------------------------
  const _store = computed(() => {
    let store = useRdsListStore({
      keepQuery: getKeepName(props, 'Query'),
      keepSelect: getKeepName(props, 'Selection'),
      ...props.dataStore,
    });
    _store_at.value = Date.now();
    //console.log('store!!!!!!!!!!!!!!', store);
    // nextTick(() => {
    //   emit('store-ready', api.value);
    // });
    return store;
  });
  //--------------------------------------------------
  const _RD = computed(
    (): RdsBrowserFeature => useRdsBrowser(_store.value, props)
  );
  //--------------------------------------------------
  const api = computed(
    (): RdsBrowserApi => ({
      Data: _store.value,
      rds: _RD.value,
    })
  );
  //--------------------------------------------------
  if (props.onSetup) {
    props.onSetup(api);
  }
  //--------------------------------------------------
  const GUILayout = computed(() => {
    let layout = useRdsBrowserLayout(props);
    if (props.guiLayout) {
      return props.guiLayout(layout, _store.value, _RD.value);
    }
    return layout;
  });
  //--------------------------------------------------
  const GUIScheme = computed(() => {
    let schema = useRdsBrowserSchema(
      props,
      _store.value,
      _RD.value,
      _hub?.view
    );
    if (props.guiSchema) {
      return props.guiSchema(schema, _store.value, _RD.value);
    }
    return schema;
  });
  //--------------------------------------------------
  watch(
    () => [_store_at.value, props.autoReload],
    () => {
      //console.log("watch RdsBrowser", _store_at.value, props.autoReload);
      if (props.autoReload && _store_at.value > 0) {
        _store.value.reload();
      }
    },
    { immediate: true }
  );
  // onMounted(() => {
  //   if (props.autoReload) {
  //     _store.value.reload();
  //   }
  // });
  //--------------------------------------------------
</script>
<template>
  <TiLayoutGrid v-bind="GUILayout" :schema="GUIScheme" class="wn-rds-browser" />
</template>
