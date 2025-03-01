<script lang="ts" setup>
  import { IconInput, TiIcon } from '@site0/tijs';
  import { computed } from 'vue';
  import { useSessionStore } from '../../../../lib';
  //--------------------------------------------------
  // let emit = defineEmits<{
  //   (event: 'logout'): void;
  // }>();
  //--------------------------------------------------
  const session = useSessionStore();
  //--------------------------------------------------
  const Me = computed(() => {
    return session.data.me ?? {};
  });
  //--------------------------------------------------
  const MyName = computed(() => {
    return Me.value.nickname || Me.value.loginName || '-???-';
  });
  //--------------------------------------------------
  const MyIcon = computed(() => {
    let re: IconInput =
      {
        UNKNOWN: 'zmdi-account',
        MALE: 'fab-twitter',
        FEMALE: 'fab-facebook',
      }[Me.value.gender || 'UNKNOWN'] || 'zmdi-account';
    return re;
  });
  //--------------------------------------------------
</script>
<template>
  <div class="wn-hub-avatar">
    <div class="as-part is-icon"><TiIcon class="s24" :value="MyIcon" /></div>
    <div class="as-part is-user">{{ MyName }}</div>
  </div>
</template>
<style lang="scss" scoped>
  @use '@site0/tijs/sass/_all.scss' as *;
  .wn-hub-avatar {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr;
    justify-content: center;
    align-items: center;
    padding: 0 0.6em;
    gap: 0.4em;
    font-size: var(--ti-fontsz-s);
    .as-part.is-user {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 8em;
    }
  }
</style>
