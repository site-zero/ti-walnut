<script lang="ts" setup>
  import { TiCrumb } from "@site0/tijs";
  import { WnObjCrumbEmitter, WnObjCrumbProps } from "./wn-obj-crumb-types";
  import { useWnObjCrumbApi } from "./use-wn-obj-crumb-api";
  //-----------------------------------------------------
  const emit = defineEmits<WnObjCrumbEmitter>();
  const props = withDefaults(defineProps<WnObjCrumbProps>(), {
    data: () => [],
  });
  //-----------------------------------------------------
  const api = useWnObjCrumbApi(props, { emit });
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-obj-crumb" :class="props.className" :style="props.style">
    <TiCrumb :data="api.CrumbItems.value" @change="api.onCrumbChange" />
  </div>
</template>
