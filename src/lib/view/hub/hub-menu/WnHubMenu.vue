<script lang="ts" setup>
  import {
    ActionBarEvent,
    ActionBarItem,
    ActionBarProps,
    TiActionBar,
  } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, inject } from 'vue';
  import { WN_HUB_APP_INST } from '../../../../lib';
  import { menuExists } from './find-menu-item';
  //--------------------------------------------------
  let emit = defineEmits<{
    (event: 'logout'): void;
  }>();
  //--------------------------------------------------
  const _hub = inject(WN_HUB_APP_INST);
  //--------------------------------------------------
  const ActionItems = computed(() => {
    let re: ActionBarProps = _.cloneDeep(_hub?.MainActions.value) ?? {};

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
        if (re.items && (re.items?.length ?? 0 > 3)) {
          // 缩之前，将顶级菜单的纯图标项目都去掉，因为不太好看
          let newItems = [] as ActionBarItem[];
          for (let barItem of re.items) {
            if (barItem.icon && !barItem.text && _.isEmpty(barItem.items)) {
              continue;
            }
            newItems.push(barItem);
          }

          // 缩入一个统一的顶级图标里
          re.items = [
            {
              icon: 'fas-bars',
              items: newItems,
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
