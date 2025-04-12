<script lang="ts" setup>
  import { Be, Dom, I18n, Icons, TI_TIP_API_KEY, TiIcon } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, inject, onUnmounted, useTemplateRef } from 'vue';
  import { WN_HUB_APP_INST } from '../../../_store';
  import { useHutFoot } from './use-hub-foot';
  import {
    DisplayFootPartItem,
    FootPart,
    WnHubFootEmitter,
    WnHubFootProps,
  } from './wn-hub-foot-types';
  //--------------------------------------------------
  const emit = defineEmits<WnHubFootEmitter>();
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
            {
              value: '=G.currentObj.id',
              icon: 'fas-key',
              valuePiping: '$ELLIPSIS',
              pipeContext: { at: 'center', maxLen: 8 },
              tip: {
                content: '->ID: ${rawValue}',
              },
            },
            { value: '=G.currentObj.c', icon: 'far-user' },
            {
              value: '=G.currentObj.ct',
              icon: 'zmdi-time',
              valuePiping: '$TIME_TEXT',
              tip: 'DT-UTC=Created On',
            },
            {
              value: '=G.currentObj.lm',
              icon: 'zmdi-time-countdown',
              valuePiping: '$TIME_TEXT',
              tip: 'DT-UTC=Modified On',
            },
            {
              value: '=G.currentObj.tp',
              icon: (ctx) => {
                return Icons.getIcon(ctx.G.currentObj || {});
              },
              tip: 'OBJ-TSMS',
            },
            {
              value: '=G.currentObj.md',
              icon: 'fas-shield-halved',
              valuePiping: '$MOD_STR',
              tip: 'OBJ-MD',
            },
            {
              value: '=G.currentObj.len',
              valuePiping: '$SIZE_TEXT',
              tip: 'OBJ-TSMS',
            },
          ],
        },
        {
          type: 'view',
          align: 'flex-end',
          flex: '1 1 auto',
          action: 'show:hub:view',
        },
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
    if (_.isString(it.action)) {
      emit(it.action, it);
      return;
    }
    if (_.isFunction(it.action)) {
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
            it.text ||
            !_.isNil(it.value) ||
            it.suffix ||
            (it.icon && !_.isNil(it.tipId))
          "
          :style="it.style"
          :data-item-key="it.itemKey"
          :data-tip="!_.isNil(it.tipId) ? `::${it.tipId}` : null"
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
