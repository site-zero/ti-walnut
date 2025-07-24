<script lang="ts" setup>
  import { Alert, I18n, Vars } from "@site0/tijs";
  import { reactive } from "vue";
  import { SignInForm } from "../../../";

  let emit = defineEmits<(event: "submit", info: SignInForm) => void>();

  const props = defineProps<{
    style?: Vars;
    username?: string;
    password?: string;
    errCode?: string;
  }>();

  const info = reactive<SignInForm>({
    username: props.username,
    password: props.password,
  });

  function onClickSubmit() {
    let { username, password } = info;
    if (!username || !password) {
      // alert('用户名和密码不能为空');
      Alert("i18n:wn-signin-e-unm-pwd-empty", { type: "warn" });
      return;
    }
    // notify to login
    emit("submit", { ...info } as SignInForm);
  }
</script>
<template>
  <div class="wn-signup-panel as-signin" :style="props.style">
    <slot name="header"></slot>
    <form>
      <dl>
        <dt>{{ I18n.get("wn-signin-form-name") }}</dt>
        <dd>
          <input
            name="username"
            :placeholder="I18n.get('wn-signin-placeholder-name')"
            v-model.trim="info.username" />
        </dd>
      </dl>
      <dl>
        <dt>{{ I18n.get("wn-signin-form-pass") }}</dt>
        <dd>
          <input
            name="password"
            type="password"
            :placeholder="I18n.get('wn-signin-placeholder-pass')"
            v-model.trim="info.password" />
        </dd>
      </dl>
      <dl>
        <button @click.prevent="onClickSubmit">
          {{ I18n.get("wn-signin-form-submit") }}
        </button>
      </dl>
      <dl v-if="errCode">
        <div class="as-error">{{ I18n.get(props.errCode!) }}</div>
      </dl>
    </form>
    <slot name="footer"> </slot>
  </div>
</template>
<style lang="scss" scoped>
  @use "./wn-sign-in.scss";
</style>
