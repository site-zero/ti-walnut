<script lang="ts" setup>
  import { CssUtils, Dom, I18n, Icons, TiIcon, TiRoadblock } from '@site0/tijs';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/default.css';
  import _ from 'lodash';
  import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
  import {
    getObjCodeType,
    getObjPreviewInfo,
    loadTextPreviewContent,
  } from './use-obj-preview';
  import { WnObjPreviewProps } from './wn-obj-preview-types';
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjPreviewProps>(), {
    emptyRoadblock: () => ({
      icon: 'fas-arrow-left',
      text: 'i18n:nil-detail',
    }),
  });
  //-----------------------------------------------------
  const _text = ref('');
  const _info = computed(() => getObjPreviewInfo(props));
  //-----------------------------------------------------
  const ObjMeta = computed(() => props.value ?? {});
  //-----------------------------------------------------
  const ObjIcon = computed(() => Icons.getIcon(ObjMeta.value, 'far-file'));
  //-----------------------------------------------------
  const ObjText = computed(() => {
    let { title, nm, id } = ObjMeta.value;
    if (title) {
      return I18n.text(title);
    }
    return nm ?? id;
  });
  //-----------------------------------------------------
  const ObjCodeType = computed(() => getObjCodeType(ObjMeta.value));
  //-----------------------------------------------------
  const MainClass = computed(() => {
    return CssUtils.mergeClassName(`is-${_info.value.type}`, {
      'has-text': !_.isEmpty(_text.value),
    });
  });
  //-----------------------------------------------------
  const $main = useTemplateRef('main');
  function highlightCode() {
    if (!$main.value) {
      return;
    }
    console.log($main.value);
    let $code = Dom.find(':scope > pre > code', $main.value);
    if ($code) {
      hljs.highlightElement($code);
    }
  }
  //-----------------------------------------------------
  watch(
    () => _info.value,
    async (info) => {
      await loadTextPreviewContent(info, _text);
      nextTick(() => highlightCode());
    },
    { immediate: true }
  );
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-obj-preview fit-parent">
    <main :class="MainClass" ref="main">
      <!-- folder: 就显示一个文件夹的图标-->
      <template v-if="'folder' == _info.type">
        <TiRoadblock :text="ObjText" :icon="ObjIcon" />
      </template>
      <!-- text: 显示一个 <pre> 包裹文本-->
      <template v-else-if="'text' == _info.type || 'json' == _info.type">
        <pre><code :class="ObjCodeType">{{ _text }}</code></pre>
      </template>
      <!-- html: 用 iframe 引入 html-->
      <template v-else-if="'html' == _info.type">
        <iframe :src="_info.src"></iframe>
      </template>
      <!-- image: 采用 <img> 加载内容-->
      <template v-else-if="'image' == _info.type">
        <img :src="_info.src" />
      </template>
      <!-- audio: 采用 <audio> 加载内容-->
      <template v-else-if="'audio' == _info.type">
        <audio :src="_info.src" controls></audio>
      </template>
      <!-- video: 采用 <video> 加载内容-->
      <template v-else-if="'video' == _info.type">
        <video :src="_info.src" controls></video>
      </template>
      <!-- binary: 显示摘要以及下载链接-->
      <template v-else-if="'binary' == _info.type">
        <header>
          <TiIcon :value="ObjIcon" />
          <h1>{{ ObjText }}</h1>
        </header>
        <footer>
          <a :href="_info.src" download>{{ I18n.text('i18n:download') }}</a>
        </footer>
      </template>
      <!-- none: 默认就是空-->
      <TiRoadblock v-else v-bind="props.emptyRoadblock" />
    </main>
  </div>
</template>
<style scoped lang="scss">
  @use './wn-obj-preview.scss';
</style>
