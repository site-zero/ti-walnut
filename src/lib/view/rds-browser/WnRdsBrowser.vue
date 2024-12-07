<script lang="ts" setup>
  //--------------------------------------------------
  import { RdsBrowserApi, useRdsListStore } from '@site0/ti-walnut';
  import { TiLayoutGrid } from '@site0/tijs';
  import { computed, nextTick, onMounted } from 'vue';
  import { useRdsBrowserLayout } from './rds-browser-layout';
  import { useRdsBrowserSchema } from './rds-browser-schema';
  import { RdsBrowserFeature, RdsBrowserProps } from './rds-browser-types';
  import { getKeepName, useRdsBrowser } from './use-rds-browser';

  //--------------------------------------------------
  const emit = defineEmits<{
    (name: 'store-ready', api: RdsBrowserApi): void;
  }>();
  //--------------------------------------------------
  const props = withDefaults(defineProps<RdsBrowserProps>(), {
    layoutQuickColumns: '50% 1fr',
    defaultKeepMode: 'local',
    autoReload: true,
  });
  //--------------------------------------------------
  const Data = computed(() => {
    let store = useRdsListStore({
      keepQuery: getKeepName(props, 'Query'),
      keepSelect: getKeepName(props, 'Selection'),
      ...props.dataStore,
    });
    nextTick(() => {
      emit('store-ready', api.value);
    });
    return store;
  });
  //--------------------------------------------------
  const _RD = computed(
    (): RdsBrowserFeature => useRdsBrowser(Data.value, props)
  );
  //--------------------------------------------------
  const api = computed(
    (): RdsBrowserApi => ({
      Data: Data.value,
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
      return props.guiLayout(layout, Data.value, _RD.value);
    }
    return layout;
  });
  //--------------------------------------------------
  const GUIScheme = computed(() => {
    let schema = useRdsBrowserSchema(props, Data.value, _RD.value);
    if (props.guiSchema) {
      return props.guiSchema(schema, Data.value, _RD.value);
    }
    return schema;
  });
  //--------------------------------------------------
  onMounted(() => {
    if (props.autoReload) {
      Data.value.reload();
    }
  });
  //--------------------------------------------------
</script>
<template>
  <TiLayoutGrid v-bind="GUILayout" :schema="GUIScheme" class="wn-rds-browser" />
</template>
