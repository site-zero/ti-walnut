<script lang="ts" setup>
  import { useWnConflictViewApi } from "./use-wn-conflict-view-api";
  import {
    WnConflictViewProps,
  } from "./wn-conflict-view-types";
  //-----------------------------------------------------
  const props = defineProps<WnConflictViewProps>();
  const api = useWnConflictViewApi(props);
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-conflict-view">Conflict View:<hr><pre>{{ api.DisplayItems }}</pre></div>
</template>
<style lang="scss">
  @use "./wn-conflict-view.scss";
</style>
