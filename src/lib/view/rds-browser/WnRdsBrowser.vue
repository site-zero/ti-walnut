<script lang="ts" setup>
  //--------------------------------------------------
  import { RdsBrowserProps, useDataListStore } from '@site0/ti-walnut';
  import { TiLayoutGrid } from '@site0/tijs';
  import { computed, onMounted } from 'vue';
  import { useRdsBrowserLayout } from './rds-browser-layout';
  import { useRdsBrowserSchema } from './rds-browser-schema';
  import { getKeepName, useRdsBrowser } from './use-rds-browser';
  //--------------------------------------------------
  const props = withDefaults(defineProps<RdsBrowserProps>(), {
    layoutQuickColumns: '50% 1fr',
    defaultKeepMode: 'local',
  });
  //--------------------------------------------------
  const Data = computed(() =>
    useDataListStore({
      keepQuery: getKeepName(props, 'Query'),
      keepSelect: getKeepName(props, 'Selection'),
      ...props.dataStore,
    })
  );
  //--------------------------------------------------
  const _RD = computed(() => useRdsBrowser(Data, props));
  //--------------------------------------------------
  const GUILayout = computed(() => {
    let layout = useRdsBrowserLayout(props);
    if (props.guiLayout) {
      return props.guiLayout(layout);
    }
    return layout;
  });
  const GUIScheme = computed(() => {
    let schema = useRdsBrowserSchema(_RD.value);
    if (props.guiSchema) {
      return props.guiSchema(schema, Data.value, _RD.value);
    }
    return schema;
  });
  //--------------------------------------------------
  onMounted(() => {
    Data.value.reload();
  });
  //--------------------------------------------------
</script>
<template>
  <TiLayoutGrid v-bind="GUILayout" :schema="GUIScheme" class="wn-rds-browser" />
</template>
