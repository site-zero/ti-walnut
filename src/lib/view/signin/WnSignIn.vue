<script lang="ts" setup>
import { reactive } from 'vue';
import { SignInForm } from '../../';
import { I18n } from '@site0/tijs'

let emit = defineEmits<(event: "submit", info: SignInForm) => void>()

const props = defineProps<{
  username?: string,
  errCode?: string
}>()

const info = reactive<SignInForm>({
  username: props.username,
  password: undefined
})

function onClickSubmit() {
  let { username, password } = info
  if (!username || !password) {
    alert("用户名和密码不能为空")
    return
  }
  // notify to login
  emit("submit", { ...info } as SignInForm)
}
</script>
<template>
  <div class="wn-signup-panel as-signin">
    <main>
      <dl>
        <dt>用户名</dt>
        <dd><input name="username" placeholder="请输入登录账户名"
            v-model.trim="info.username">
        </dd>
      </dl>
      <dl>
        <dt>密码</dt>
        <dd><input name="password" type="password" placeholder="请输入登录密码"
            v-model.trim="info.password"></dd>
      </dl>
      <dl>
        <button @click="onClickSubmit">立即登录</button>
      </dl>
      <dl v-if="errCode">
        <div class="as-error">{{ I18n.get(props.errCode!) }}</div>
      </dl>
    </main>
  </div>
</template>
<style lang="scss" scoped>
@use "@site0/tijs/scss" as *;
@import "../../../assets/style/_signup_panel";
</style>