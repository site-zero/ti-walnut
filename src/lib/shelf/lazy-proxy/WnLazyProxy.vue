<script lang="ts" setup>
  import { tiCheckComponent } from '@site0/tijs';
  import { computed, watch } from 'vue';
  import { useLazyProxy } from './use-lazy-proxy';
  import { WnLazyProxyProps } from './wn-lazy-proxy-types';
  //-----------------------------------------------------
  const emit = defineEmits<{
    (event: string, payload: any): void;
  }>();
  //-----------------------------------------------------
  const props = defineProps<WnLazyProxyProps>();
  //-----------------------------------------------------
  const _lazy = computed(() => useLazyProxy(props));
  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const ProxiedCom = computed(() => {
    return {
      comType: tiCheckComponent(props.comType || 'TiRoadblock'),
      comConf: _lazy.value.buildComConf(),
    };
  });
  //-----------------------------------------------------
  // 事件
  //-----------------------------------------------------
  const onEvents = computed(() => {
    const _on_com_event_emit = (eventName: string, payload: any) => {
      console.log(`WnLazyProxy [${eventName}]`, payload);
      emit(eventName, payload);
    };
    let listners: Record<string, Function> = {};
    for (let eventName of ProxiedCom.value.comType.events) {
      listners[eventName] = (payload: any) =>
        _on_com_event_emit(eventName, payload);
    }
    return listners;
  });
  //-----------------------------------------------------
  // 监控
  //-----------------------------------------------------
  watch(
    () => _lazy.value.loadContext,
    async (loadContext) => {
      if (
        loadContext &&
        _lazy.value.needLoadContext(ProxiedCom.value.comConf)
      ) {
        console.log('!!!!!!!!!!!!!WnLazyProxy: loadContext');
        await loadContext();
      }
    },
    { immediate: true }
  );
  //-----------------------------------------------------
</script>
<template>
  <component
    :is="ProxiedCom.comType.com"
    v-bind="ProxiedCom.comConf"
    v-on="onEvents" />
</template>
