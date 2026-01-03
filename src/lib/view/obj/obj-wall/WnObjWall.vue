<script lang="ts" setup>
  import { TiWall, WallProps } from "@site0/tijs";
  import _ from "lodash";
  import { computed } from "vue";
  import { useObjWallApi } from "./use-obj-wall-item";
  import { WnObjWallEmitter, WnObjWallProps } from "./wn-obj-wall-types";
  //-----------------------------------------------------
  const emit = defineEmits<WnObjWallEmitter>();
  const props = withDefaults(defineProps<WnObjWallProps>(), {
    canSelect: true,
    showChecker: true,
    multi: true,
    layoutHint: "<120>",
  });
  //-----------------------------------------------------
  const api = useObjWallApi(props);
  //-----------------------------------------------------
  const WallConfig = computed((): Partial<WallProps> => {
    return _.assign({}, _.omit(props, "data"), {
      wallItem: api.getWallItem,
    });
  });
  //-----------------------------------------------------
</script>
<template>
  <TiWall v-bind="WallConfig" :data="props.data" />
</template>
