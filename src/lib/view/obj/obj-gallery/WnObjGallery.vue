<script lang="ts" setup>
  import { BUS_KEY, CssUtils, TiRoadblock, TiThumb } from "@site0/tijs";
  import {
    computed,
    inject,
    onMounted,
    onUnmounted,
    ref,
    useTemplateRef,
    watch,
  } from "vue";
  import { useObjDropToUpload, WnObjTable, WnObjWall } from "../";
  import { ObjUploadItem } from "../../../_types";
  import { useWnObjGalleryApi } from "./use-wn-obj-gallery-api";
  import {
    WnObjGalleryEmitter,
    WnObjGalleryProps,
  } from "./wn-obj-gallery-types";
  //-------------------------------------------------------
  const bus = inject(BUS_KEY);
  //-----------------------------------------------------
  const emit = defineEmits<WnObjGalleryEmitter>();
  const props = withDefaults(defineProps<WnObjGalleryProps>(), {
    mode: "wall",
  });
  //-----------------------------------------------------
  const $el = useTemplateRef("el");
  const _drag_enter = ref(false);
  const _upload_files = ref<ObjUploadItem[]>([]);
  //-----------------------------------------------------
  const _upload_api = useObjDropToUpload({
    _drag_enter,
    _upload_files,
    target: () =>
      $el.value && props.upload ? ($el.value as HTMLElement) : null,
    uploadOptions: () => props.upload,
    callback: (objs) => emit("upload:done", objs),
  });
  //-----------------------------------------------------
  const TopClass = computed(() => {
    return CssUtils.mergeClassName(
      {
        "drag-enter": _drag_enter.value || hasUploading.value,
      },
      props.className
    );
  });
  //-----------------------------------------------------
  const TopStyle = computed(() => CssUtils.toStyle(props.style));
  //-----------------------------------------------------
  const hasUploading = computed(() => _upload_files.value.length > 0);
  //-----------------------------------------------------
  function doUpload() {
    console.log("doUpload");
    _upload_api.doUploadFiles();
  }
  //-----------------------------------------------------
  const _api = useWnObjGalleryApi(props, emit);
  //-----------------------------------------------------
  let _watched_bus_key: string | undefined = undefined;
  watch(
    () => props.busUploadKey,
    () => {
      if (_watched_bus_key) {
        bus?.off(doUpload, _watched_bus_key);
      }
      if (bus && props.busUploadKey) {
        bus.on(props.busUploadKey, doUpload);
        _watched_bus_key = props.busUploadKey;
      }
    },
    { immediate: true }
  );
  //-----------------------------------------------------
  watch(
    () => props.upload,
    () => {
      _upload_api.reset();
    }
  );
  //-----------------------------------------------------
  onMounted(() => {
    if (props.upload) {
      _upload_api.reset();
    }
  });
  //-----------------------------------------------------
  onUnmounted(() => {
    if (_watched_bus_key) {
      bus?.off(doUpload, _watched_bus_key);
    }
  });
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-obj-gallery" :class="TopClass" :style="TopStyle" ref="el">
    <div class="gallery-main">
      <!--========== Table ============-->
      <WnObjTable
        v-if="props.mode === 'table'"
        v-bind="props.table"
        :data="props.data"
        :current-id="props.currentId"
        :checked-ids="props.checkedIds"
        :empty-roadblock="props.emptyRoadblock"
        @select="_api.onSelect"
        @open="_api.onOpenTableItem" />
      <!--========== Wall ============-->
      <WnObjWall
        v-else-if="props.mode === 'wall'"
        v-bind="props.wall"
        :data="props.data"
        :current-id="props.currentId"
        :checked-ids="props.checkedIds"
        :empty-roadblock="props.emptyRoadblock"
        @select="_api.onSelect"
        @open="_api.onOpenWallItem" />
      <!--========== 不支持的模式 ============-->
      <TiRoadblock
        v-else
        icon="zmdi-alert-octagon"
        :text="`Unsupport gallery mode [${props.mode}]`" />
    </div>
    <div class="uploading-box">
      <main v-if="hasUploading">
        <TiThumb
          v-for="item in _upload_files"
          :preview="item.preview"
          :progress="{ value: item.progress }"
          :text="item.text"
          :width="item.width"
          :height="item.height"
          :text-size="item.textSize"
          :text-align="item.textAlign"
          :text-padding="item.textPadding" />
      </main>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  @use "./wn-obj-gallery.scss";
</style>
