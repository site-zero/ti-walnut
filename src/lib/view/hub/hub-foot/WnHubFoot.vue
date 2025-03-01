<script lang="ts" setup>
  import { computed, inject } from 'vue';
  import { WN_HUB_APP_INST } from '../../../_store';
  //--------------------------------------------------
  const _hub = inject(WN_HUB_APP_INST);
  //--------------------------------------------------
  const AppPath = computed(() => _hub?.view.global.parseAppPath());
  //--------------------------------------------------
</script>

<template>
  <div class="wn-foot">
    AppPath: {{ _hub?.view.global.data.appPath }} :: {{ AppPath }}
  </div>
</template>
