<script lang="ts" setup>
  import {
    Alert,
    Alg,
    IconInput,
    Prompt,
    TiIcon,
    AjaxResult,
    AlertError,
  } from "@site0/tijs";
  import _ from "lodash";
  import { computed } from "vue";
  import { Walnut } from "../../../../..";
  import { UserInfo, useSessionStore } from "../../../../lib";
  import { WnHubAvatarProps } from "./wn-hub-avatar-types";
  //--------------------------------------------------
  // let emit = defineEmits<{
  //   (event: 'logout'): void;
  // }>();
  //--------------------------------------------------
  const props = defineProps<WnHubAvatarProps>();
  //--------------------------------------------------
  const session = useSessionStore();
  //--------------------------------------------------
  const Me = computed((): UserInfo => {
    return session.data.me ?? {};
  });
  //--------------------------------------------------
  const MyName = computed(() => {
    return Me.value.nickname || Me.value.loginName || "-???-";
  });
  //--------------------------------------------------
  const isAdmin = computed(() => {
    return session.data.mainRole == "ADMIN";
  });
  //--------------------------------------------------
  const MyIcon = computed(() => {
    if (isAdmin.value) {
      return "fas-user-secret";
    }
    let re: IconInput =
      {
        UNKNOWN: "fas-user-tie",
        MALE: "fab-twitter",
        FEMALE: "fab-facebook",
      }[Me.value.gender || "UNKNOWN"] || "fas-user-tie";
    return re;
  });
  //--------------------------------------------------
  async function onClickMyName() {
    if (!props.loginSitePath) {
      Alert("loginSitePath without defined", { type: "danger" });
      return;
    }
    if (isAdmin.value) {
      let _name = await Prompt("Input the User you want to Login", {
        type: "primary",
      });
      let newName = _.trim(_name).replaceAll(/['"]/g, "");
      // 用户取消
      if (!newName) {
        return;
      }

      // 准备命令
      let cmdText = `login -site "${props.loginSitePath}" "${newName}"`;
      // 准备宏分隔符，因为要用服务器宏自动登录切换 session
      let mos = ["%%", Alg.genSnowQ(20, "%wn.meta."), "%%"].join("");

      // 执行登录
      let re: AjaxResult = await Walnut.exec(cmdText, {
        as: "json",
        mos,
        forceFlushBuffer: true,
      });

      // 如果成功，不管怎么样，刷新一下页面
      if (re.ok) {
        _.delay(() => {
          window.location.reload();
        }, 300);
      } else {
        await AlertError("Fail to login", cmdText, re);
      }
    }
  }
  //--------------------------------------------------
</script>
<template>
  <div class="wn-hub-avatar">
    <div class="as-part is-icon"><TiIcon :value="MyIcon" /></div>
    <div v-if="isAdmin" class="as-part is-user">
      <a @click.left.stop="onClickMyName()">{{ MyName }}</a>
    </div>
    <div v-else class="as-part is-user">{{ MyName }}</div>
  </div>
</template>
<style lang="scss">
  @use "@site0/tijs/sass/_all.scss" as *;
  .wn-hub-avatar {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr;
    justify-content: center;
    align-items: center;
    padding: 0 0.6em;
    gap: 0.4em;
    .as-part.is-icon {
      font-size: 1.2em;
    }
    .as-part.is-user {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 8em;
    }
  }
</style>
