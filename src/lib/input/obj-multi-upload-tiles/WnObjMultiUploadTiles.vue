<script lang="ts" setup>
  import { ObjUploadItem, WnObjWall, WnObjWallProps } from "@site0/ti-walnut";
  import { I18n, TiIcon, TiLoading, TiThumb } from "@site0/tijs";
  import { computed, onMounted, ref, useTemplateRef, watch } from "vue";

  import TiActionBar from "../../../../../tijs/src/lib/action/actionbar/TiActionBar.vue";
  import { useWnObjMultiUploadTilesActions } from "./use-wn-omup-actions";
  import { useWnObjMultiUploadTilesApi } from "./use-wn-omup-api";
  import {
    WnObjMultiUploadTilesEmitter,
    WnObjMultiUploadTilesProps,
  } from "./wn-omup-types";
  //-----------------------------------------------------
  const emit = defineEmits<WnObjMultiUploadTilesEmitter>();
  const props = withDefaults(defineProps<WnObjMultiUploadTilesProps>(), {
    placeholder: "i18n:wn-obj-multi-upload-tiles-placeholder",
    uploadIcon: "fas-upload",
    valueType: "idPath",
  });
  //-----------------------------------------------------
  const $el = useTemplateRef("el");
  const _drag_enter = ref(false);
  const _upload_files = ref<ObjUploadItem[]>([]);
  //-----------------------------------------------------
  const api = useWnObjMultiUploadTilesApi(props, {
    emit,
    upload: {
      _drag_enter,
      _upload_files,
      target: () =>
        $el.value && props.upload ? ($el.value as HTMLElement) : null,
      screenshotName: props.screenshotName,
      uploadOptions: () => props.upload,
      callback: (objs) => emit("change", objs),
    },
  });
  //-----------------------------------------------------
  const TopClass = computed(() => {
    return {
      "drag-enter": _drag_enter.value || hasUploading.value,
    };
  });
  //-----------------------------------------------------
  const hasUploading = computed(() => _upload_files.value.length > 0);
  //-----------------------------------------------------
  const ActionConfig = computed(() =>
    useWnObjMultiUploadTilesActions(props, api)
  );
  //-----------------------------------------------------
  const WnObjWallConfig = computed((): WnObjWallProps => {
    return {
      layoutHint: "<90>",
      style: {
        padding: 0,
      },
      conStyle: {
        padding: "var(--ti-gap-m)",
      },
      showChecker: true,
      currentId: api.CurrentId.value,
      checkedIds: api.CheckedIds.value,
      preview: {
        height: "72px",
        width: "72px",
        style: { margin: "0 auto" },
      },
      thumbAspect: {
        textSize: "s",
      },
    };
  });
  //-----------------------------------------------------
  watch(
    () => props.upload,
    () => {
      api.UploadApi.reset();
    }
  );
  //-----------------------------------------------------
  watch(
    () => props.value,
    async () => {
      await api.reloadObjs();
    },
    { immediate: true }
  );
  //-----------------------------------------------------
  watch(
    () => props.mountHome,
    async () => {
      await api.reloadMountHome();
    },
    { immediate: true }
  );
  //-----------------------------------------------------
  onMounted(() => {
    if (props.upload) {
      api.UploadApi.reset();
    }
  });
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-obj-multi-upload-tiles" :class="TopClass" ref="el">
    <!--| 菜单条 |-->
    <div class="part-menu">
      <div class="menu-head">
        <TiIcon :value="api.HeadIcon.value" />
        <span>{{ api.HeadText.value }}</span>
        <a
          v-if="api.HeadObjText.value"
          :href="api.HeadObjHref.value"
          target="_blank"
          >{{ api.HeadObjText.value }}</a
        >
      </div>
      <TiActionBar v-bind="ActionConfig" />
    </div>
    <!--| 占位 |-->
    <div
      class="placeholder"
      v-if="api.isEmpty.value"
      @click.left="api.doUploadFiles()">
      <TiIcon :value="props.uploadIcon" />
      <span>{{ I18n.text(props.placeholder) }}</span>
    </div>
    <template v-else>
      <!--| 展示控件 |-->
      <WnObjWall
        v-bind="WnObjWallConfig"
        :data="api.ObjList.value"
        @select="api.onSelect"
        @open="api.open" />
    </template>
    <!--| 状态信息 |-->
    <TiLoading
      v-if="api.isBusy.value"
      class="is-secondary"
      mode="cover"
      layout="C"
      size="s"
      :text-style="{ flex: '0 0 auto' }"
      :opacity="0.4"
      :text="api.BusyText.value" />
    <!-- <hr />
    {{ props.status }}
    <hr />
    checkedIds:{{ api.CheckedIds.value }}
    <br />
    currentId:{{ api.CurrentId.value }} -->
    <!--| 上传 |-->
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
<style lang="scss">
  @use "./wn-omup.scss";
</style>
