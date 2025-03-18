<script lang="ts" setup>
  //--------------------------------------------------
  import { TiLayoutGrid } from '@site0/tijs';
  import { computed, inject, ref, watch } from 'vue';
  import { useRdsListStore, WN_HUB_APP_INST } from '../../../../lib';
  import { useRdsBrowserLayout } from './rds-browser-layout';
  import { useRdsBrowserSchema } from './rds-browser-schema';
  import { RdsBrowserEmitter, RdsBrowserProps } from './rds-browser-types';
  import { getKeepName, useRdsBrowser } from './use-rds-browser';
  //--------------------------------------------------
  const emit = defineEmits<RdsBrowserEmitter>();
  //--------------------------------------------------
  const _hub = inject(WN_HUB_APP_INST);
  //--------------------------------------------------
  const props = withDefaults(defineProps<RdsBrowserProps>(), {
    layoutQuickColumns: '50% 1fr',
    layoutQuickRows: 'auto auto 1fr auto',
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
    console.log('store!!!!!!!!!!!!!!', store);
    // nextTick(() => {
    //   emit('store-ready', api.value);
    // });
    return store;
  });
  //--------------------------------------------------
  const _api = computed(() => useRdsBrowser(_store.value, props, emit));
  //--------------------------------------------------
  if (props.onSetup) {
    props.onSetup(_api);
  }
  //--------------------------------------------------
  const GUILayout = computed(() => {
    let layout = useRdsBrowserLayout(props);
    if (props.guiLayout) {
      return props.guiLayout(layout, _api.value);
    }
    return layout;
  });
  //--------------------------------------------------
  const GUIScheme = computed(() => {
    let schema = useRdsBrowserSchema(props, _api.value, _hub?.view);
    if (props.guiSchema) {
      return props.guiSchema(schema, _api.value);
    }
    return schema;
  });
  //--------------------------------------------------
  watch(
    () => [_store_at.value, props.autoReload],
    () => {
      console.log("watch RdsBrowser", _store_at.value, props.autoReload);
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
