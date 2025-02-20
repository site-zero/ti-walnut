<script lang="ts" setup>
  import { WN_HUB_APP_INST } from '@site0/ti-walnut';
  import { ActionBarEvent, ActionBarProps, TiActionBar } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, inject } from 'vue';
  import { menuExists } from './find-menu-item';
  //--------------------------------------------------
  let emit = defineEmits<{
    (event: 'logout'): void;
  }>();
  //--------------------------------------------------
  const _hub = inject(WN_HUB_APP_INST);
  //--------------------------------------------------
  const ActionItems = computed(() => {
    let re: ActionBarProps = _hub?.MainActions.value ?? {};

    const logout = {
      name: 'logout',
      text: 'Logout',
      icon: 'fas-arrow-right-from-bracket',
      action: 'logout',
    };

    // 根本就是空的菜单，直接设置一个菜单项即可
    if (_.isEmpty(re.items)) {
      re.items = [logout];
    }
    // 尝试将 logout 插入到菜单里
    else {
      let finding = [{ name: 'logout' }, { action: 'logout' }];
      // 寻找 action，或者 name 为 logout 的菜单项
      // 如果还没有，顶级菜单结尾，添加一个
      if (!menuExists(re.items ?? [], finding)) {
        re.items?.push({}, logout);
        // 太长了，自动缩一缩
        if (re.items?.length ?? 0 > 3) {
          re.items = [
            {
              icon: 'fas-bars',
              items: re.items,
            },
          ];
        }
      }
    }

    return re;
  });
  //--------------------------------------------------
  function onActionFire(event: ActionBarEvent) {
    let { name: eventName, payload } = event;
    if ('logout' === eventName) {
      emit('logout');
    }
    // 交给视图处理其他的事件
    else {
      _hub!.view.onActionFire(event);
    }
  }
  //--------------------------------------------------
</script>

<template>
  <TiActionBar
    v-bind="ActionItems"
    :vars="_hub!.view.ActioinBarVars"
    @fire="onActionFire" />
</template>
