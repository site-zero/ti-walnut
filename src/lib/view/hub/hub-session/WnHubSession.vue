<script lang="ts" setup>
  import { TiIcon, useDocking } from "@site0/tijs";
  import { computed, ref, useTemplateRef } from "vue";
  import { useWnHubSessionApi } from "./use-wn-hub-session-api";
  import {
    WnHubSessionEmitter,
    WnHubSessionProps,
  } from "./wn-hub-session-types";
  //-----------------------------------------------------
  const $badge = useTemplateRef("badge");
  //-----------------------------------------------------
  const emit = defineEmits<WnHubSessionEmitter>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnHubSessionProps>(), {
    loginSitePath: "~/www/login",
    adminRole: "ADMIN",
  });
  const api = useWnHubSessionApi(props, emit);
  //-----------------------------------------------------
  const _show_menu = ref(false);
  //-----------------------------------------------------
  const _docking = useDocking({
    getElement: () => $badge.value,
    space: 10,
  });
  //-----------------------------------------------------
  const PartMenuStyle = computed(() => _docking.genDockingStyle());
  //-----------------------------------------------------
  const UserIcon = computed(() => {
    if (api.UserRace.value === "SYS") {
      return "fas-user-tie";
    }
    if (api.UserRace.value === "DOMAIN") {
      return "fas-circle-user";
    }
    return "far-user";
  });
  //-----------------------------------------------------
  function onClickBadge() {
    _show_menu.value = !_show_menu.value;
  }
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-hub-session">
    <!--
    || 未登录
    -->
    <template v-if="!api.isLoggedIn.value">
      <div class="no-session">No Session</div>
    </template>
    <!--
    || 已登录
    -->
    <template v-else>
      <div class="part-badge" ref="badge" @click="onClickBadge">
        <TiIcon :value="UserIcon" />
        <span>{{ api.UserName.value }}</span>
        <i class="zmdi zmdi-settings"></i>
      </div>
    </template>
    <template v-if="_show_menu">
      <!--
    || 遮罩
    -->
      <div class="part-mask" @click="_show_menu = false"></div>
      <!--
    || 操作菜单
    -->
      <div class="part-menu" ref="menu" :style="PartMenuStyle">
        <div class="menu-con" @click="_show_menu = false">
          <div class="menu-item" @click="api.doChangePassword()">
            <i class="fa-solid fa-user-lock"></i>
            <span>Change Password</span>
          </div>
          <hr />
          <template v-if="api.CanSignInByAnotherUser.value">
            <div class="menu-item" @click="api.signInByAnotherUser()">
              <i class="fa-solid fa-clipboard-user"></i>
              <span>Sign In With Other User</span>
            </div>
            <hr />
          </template>
          <div class="menu-item" @click="emit('logout')">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Sign Out</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<style lang="scss">
  @use "./wn-hub-session.scss";
</style>
