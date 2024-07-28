<script lang="ts" setup>
  import { onMounted, onUnmounted, ref } from 'vue';
import { useCmdRunner } from './use-cmd-runner';
import { WnCmdRunnerEmitter, WnCmdRunnerProps } from './wn-cmd-runner-types';
  //-------------------------------------------------------
  let emit = defineEmits<WnCmdRunnerEmitter>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnCmdRunnerProps>(), {
    preface: '# It will run a command, please wait ...',
    epilog: 'Command done',
  });
  const _lines = ref<string[]>([]);
  const _processing = ref(false);
  const _duration = ref(0);
  const $main = ref<HTMLElement>();
  const CR = useCmdRunner(props, { _lines, _processing, _duration, emit });
  //-----------------------------------------------------
  const observer = new MutationObserver(() => {
    if (!$main.value) {
      return;
    }
    let el = $main.value;
    el.scrollTop = el.scrollHeight;
    // console.log('line changed');
  });
  //-----------------------------------------------------
  onMounted(() => {
    CR.reload();
    if ($main.value) {
      observer.observe($main.value, { childList: true, subtree: false });
    }
  });
  //-----------------------------------------------------
  onUnmounted(() => {
    observer.disconnect();
  });
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-cmd-runner">
    <div class="wcr-con">
      <main ref="$main">
        <div class="cmd-line" v-for="line in _lines">{{ line }}</div>
        <div class="cmd-line as-process" v-if="_processing">
          <i class="zmdi zmdi-settings zmdi-hc-spin"></i>
          <span>...</span>
        </div>
      </main>
    </div>
  </div>
</template>
<style scoped lang="scss">
  @use '@site0/tijs/scss' as *;
  @import './wn-cmd-runner.scss';
</style>
