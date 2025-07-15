<script lang="ts" setup>
  import { I18n, Vars } from '@site0/tijs';
  import { reactive } from 'vue';
  import { SignInForm } from '../../../';

  let emit = defineEmits<(event: 'submit', info: SignInForm) => void>();

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
      alert('用户名和密码不能为空');
      return;
    }
    // notify to login
    emit('submit', { ...info } as SignInForm);
  }
</script>
<template>
  <div class="wn-signup-panel as-signin" :style="props.style">
    <slot name="header"></slot>
    <form>
      <dl>
        <dt>用户名</dt>
        <dd>
          <input
            name="username"
            placeholder="请输入登录账户名"
            v-model.trim="info.username" />
        </dd>
      </dl>
      <dl>
        <dt>密码</dt>
        <dd>
          <input
            name="password"
            type="password"
            placeholder="请输入登录密码"
            v-model.trim="info.password" />
        </dd>
      </dl>
      <dl>
        <button @click.prevent="onClickSubmit">立即登录</button>
      </dl>
      <dl v-if="errCode">
        <div class="as-error">{{ I18n.get(props.errCode!) }}</div>
      </dl>
    </form>
    <slot name="footer"> </slot>
  </div>
</template>
<style lang="scss" scoped>
  @use './wn-sign-in.scss';
</style>
