<script lang="ts" setup>
  import { Be, Dom, I18n, TI_TIP_API_KEY, TiIcon } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, inject, onUnmounted, useTemplateRef } from 'vue';
  import { WN_HUB_APP_INST } from '../../../_store';
  import { useHutFoot } from './use-hub-foot';
  import {
    DisplayFootPartItem,
    FootPart,
    WnHubFootProps,
  } from './wn-hub-foot-types';
  //--------------------------------------------------
  const _tip_api = inject(TI_TIP_API_KEY);
  const _tip_ids: number[] = [];
  //--------------------------------------------------
  onUnmounted(() => {
    if (!_.isEmpty(_tip_ids)) {
      _tip_api!.removeTip(..._tip_ids);
    }
  });
  //--------------------------------------------------
  const $el = useTemplateRef('el');
  const _hub = inject(WN_HUB_APP_INST);
  //--------------------------------------------------
  const props = withDefaults(defineProps<WnHubFootProps>(), {
    align: 'flex-start',
    parts: () =>
      [
        {
          type: 'info',
          icon: 'zmdi-cloud-outline',
          items: [
            { value: '=id' },
            { value: '=c', icon: 'far-user' },
            { value: '=ct', icon: 'zmdi-time', valuePiping: '$TIME_TEXT' },
            { value: '=sha1', icon: 'fas-fingerprint' },
            { value: '=len', valuePiping: '$SIZE_TEXT' },
          ],
        },
        { type: 'view', align: 'flex-end', flex: '1 1 auto' },
        { type: 'selection', icon: 'zmdi-mouse', flex: '0 0 auto' },
      ] as FootPart[],
  });
  //--------------------------------------------------
  const _parts = computed(() =>
    useHutFoot(props, _hub!.view, _tip_api!, _tip_ids)
  );
  //--------------------------------------------------
  const TopStyle = computed(() => {
    return {
      'justify-content': props.align ?? 'flex-start',
    };
  });
  //--------------------------------------------------
  function onClickItem(it: DisplayFootPartItem, event: MouseEvent) {
    // console.log('onClickItem', it, event);
    // 指定了自定义事件
    if (it.action) {
      it.action(it);
      return;
    }
    // 复制裸值: Ctrl + 点击
    if (event.ctrlKey) {
      Be.Clipboard.write(it.rawValue);
    }
    // 复制显示值
    else {
      Be.Clipboard.write(it.value);
    }
    let $item = Dom.find(`[data-item-key="${it.itemKey}"]`, $el.value!);
    if ($item) {
      Be.BlinkIt($item);
    }
  }
  //--------------------------------------------------
</script>

<template>
  <div class="wn-foot" ref="el" :style="TopStyle">
    <section
      v-for="part in _parts"
      :key="part.uniqKey"
      :data-type="part.type"
      :style="part.style">
      <div class="part-icon" v-if="part.icon">
        <TiIcon :value="part.icon" />
      </div>
      <div class="part-text" v-if="part.text">{{ I18n.text(part.text) }}</div>
      <template v-for="it in part.items" :key="it.itemKey">
        <dl
          v-if="
            it.text || !_.isNil(it.value) || it.suffix || (it.icon && it.tip)
          "
          :style="it.style"
          :data-item-key="it.itemKey"
          :data-tip="it.tipId ? `::${it.tipId}` : null"
          @click.left="onClickItem(it, $event)">
          <dt v-if="it.icon"><TiIcon :value="it.icon" /></dt>
          <dt v-if="it.text">{{ I18n.text(it.text) }}</dt>
          <dd v-if="!_.isNil(it.value)">{{ it.value }}</dd>
          <dd v-if="it.suffix">{{ it.suffix }}</dd>
        </dl>
      </template>
    </section>
  </div>
</template>
<style scoped lang="scss">
  @use './wn-hub-foot.scss';
</style>
