<script lang="ts" setup>
  import { I18n } from "@site0/tijs";
  import { WnSignInOTPEmitter, WnSignInOTPProps } from "./wn-sign-in-otp-types";
  import { useWnSignInOTPApi } from "./use-wn-sign-in-otp-api";

  const emit = defineEmits<WnSignInOTPEmitter>();
  const props = withDefaults(defineProps<WnSignInOTPProps>(), {
    mode: "PASSWD_AND_OTP",
    otpCooldown: 60,
  });
  const {
    info,
    authWay,
    cooldown,
    sending,
    captchaVisible,
    captchaBox,
    modeSelectVisible,
    passwordVisible,
    otpVisible,
    otpButtonDisabled,
    setAuthWay,
    onClickSubmit,
    onClickGetOtp,
  } = useWnSignInOTPApi(props, { emit });
</script>

<template>
  <div
    class="wn-signup-panel as-signin wn-sign-in-otp"
    :style="props.style">
    <slot name="header"></slot>
    <form @submit.prevent="onClickSubmit">
      <dl>
        <dt>{{ I18n.get("wn-signin-form-name") }}</dt>
        <dd>
          <input
            name="username"
            autocomplete="username"
            :placeholder="I18n.get('wn-signin-placeholder-name')"
            v-model.trim="info.username" />
        </dd>
      </dl>

      <dl v-if="modeSelectVisible" class="as-auth-way">
        <dd>
          <button
            type="button"
            :class="{ 'is-active': authWay === 'password' }"
            @click="setAuthWay('password')">
            {{ I18n.get("wn-sign-in-otp-way-password") }}
          </button>
          <button
            type="button"
            :class="{ 'is-active': authWay === 'otp' }"
            @click="setAuthWay('otp')">
            {{ I18n.get("wn-sign-in-otp-way-otp") }}
          </button>
        </dd>
      </dl>

      <dl v-if="passwordVisible">
        <dt>{{ I18n.get("wn-signin-form-pass") }}</dt>
        <dd>
          <input
            name="password"
            type="password"
            autocomplete="current-password"
            :placeholder="I18n.get('wn-signin-placeholder-pass')"
            v-model.trim="info.password" />
        </dd>
      </dl>

      <dl v-if="otpVisible">
        <dt>{{ I18n.get("wn-sign-in-otp-form-otp") }}</dt>
        <dd class="as-otp-input">
          <input
            name="otp"
            inputmode="numeric"
            autocomplete="one-time-code"
            :placeholder="I18n.get('wn-sign-in-otp-placeholder-otp')"
            v-model.trim="info.otp_val" />
          <button
            type="button"
            :disabled="otpButtonDisabled"
            @click="onClickGetOtp">
            <span v-if="cooldown > 0">
              {{ I18n.get("wn-sign-in-otp-form-retry") }}（{{ cooldown }}s）
            </span>
            <span v-else-if="sending">
              {{ I18n.get("wn-sign-in-otp-form-sending") }}
            </span>
            <span v-else>{{ I18n.get("wn-sign-in-otp-form-get-otp") }}</span>
          </button>
        </dd>
      </dl>

      <dl>
        <button type="submit">
          {{ I18n.get("wn-signin-form-submit") }}
        </button>
      </dl>
      <dl v-if="props.errCode">
        <div class="as-error">{{ I18n.get(props.errCode) }}</div>
      </dl>
    </form>
    <slot name="footer"></slot>

    <div v-if="captchaVisible" class="as-captcha-mask">
      <div class="as-captcha-dialog">
        <div ref="captchaBox"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @use "./wn-sign-in-otp.scss";
</style>
