<script lang="ts" setup>
  import {
    BUS_KEY,
    TiLoading,
    TiMainFrame,
    createAppBus,
    watchAppResize,
  } from '@site0/tijs';
  import { onBeforeMount, onUnmounted, provide } from 'vue';
  import { WnSignIn, useGlobalStatus, useSessionStore } from '../../';

  //
  // Global Bus
  //
  let bus = createAppBus(onUnmounted);
  provide(BUS_KEY, bus);
  watchAppResize(bus);
  //
  // Stores
  //
  const status = useGlobalStatus();
  const session = useSessionStore();
  //
  // Methods
  //
  onBeforeMount(async () => {
    await session.reload();
  });
</script>
<template>
  <!--显示加载界面-->
  <template v-if="status.appLoading">
    <TiLoading text="应用加载中..." />
  </template>
  <!--显示登录面板-->
  <template v-else-if="!session.ticket">
    <WnSignIn
      username="demo"
      :errCode="session.errCode.value"
      @submit="session.signIn($event)" />
  </template>
  <!--显示主界面-->
  <template v-else>
    <TiMainFrame mode="T">
      <template v-slot:sky>I am sky</template>
    </TiMainFrame>
  </template>
</template>
