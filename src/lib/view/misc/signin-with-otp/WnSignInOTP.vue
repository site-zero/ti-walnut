<script setup lang="ts">
  import { CssUtils, I18n, SwitcherProps, TiSwitcher } from "@site0/tijs";
  import { computed, watch } from "vue";
  import { useWnSignInOTPApi } from "./use-wn-sign-in-otp-api";
  import type {
    WnSignInAuthWay,
    WnSignInOTPEmitter,
    WnSignInOTPProps,
  } from "./wn-sign-in-otp-types";
  //-----------------------------------------------------
  const emit = defineEmits<WnSignInOTPEmitter>();
  const props = withDefaults(defineProps<WnSignInOTPProps>(), {
    mode: "PASSWD_ONLY",
    otpCooldown: 60,
  });
  //-----------------------------------------------------
  const api = useWnSignInOTPApi(props, { emit });
  //-----------------------------------------------------
  const TopStyle = computed(() => CssUtils.toStyle(props.style));
  //-----------------------------------------------------
  const AuthWayConfig = computed(() => {
    return {
      style: {
        backgroundColor: "var(--ti-color-primary-r)",
      },
      defaultItemType: "primary",
      options: api.AuthWayOptions.value,
      value: api.AuthWay.value,
      autoI18n: true,
      onChange: (value: WnSignInAuthWay) => {
        api.setAuthWay(value);
      },
    } as SwitcherProps;
  });
  //-----------------------------------------------------
  watch(
    () => props.otp,
    (newOtp) => {
      api.info.otp = newOtp;
    }
  );
  //-----------------------------------------------------
  watch(
    () => props.mode,
    (newMode) => {
      if (newMode === "PASSWD_ONLY") {
        api.closeCaptcha();
      }
    }
  );
</script>

<template>
  <div class="wn-signup-panel as-signin wn-sign-in-otp" :style="TopStyle">
    <slot name="header"></slot>
    <form @submit.prevent="api.onClickSubmit">
      <!--
      用户名
      -->
      <dl>
        <dt>{{ I18n.get("wn-signin-form-name") }}</dt>
        <dd>
          <input
            name="username"
            autocomplete="username"
            :placeholder="I18n.get('wn-signin-placeholder-name')"
            v-model.trim="api.info.username" />
        </dd>
      </dl>
      <!--
      显示模式选择: PASSWD_OR_OTP 的时候
      -->
      <div v-if="api.ShowModeSelect.value" class="part-auth-way">
        <TiSwitcher v-bind="AuthWayConfig" />
      </div>
      <!--
      密码输入框
      -->
      <dl v-if="api.ShowPassword.value">
        <dt>{{ I18n.get("wn-signin-form-pass") }}</dt>
        <dd>
          <input
            name="password"
            type="password"
            autocomplete="current-password"
            :placeholder="I18n.get('wn-signin-placeholder-pass')"
            v-model="api.info.password" />
        </dd>
      </dl>
      <!--
      一次性密码输入框
      -->
      <dl v-if="api.ShowOtp.value">
        <dt>{{ I18n.get("wn-sign-in-otp-form-otp") }}</dt>
        <dd class="part-otp-input">
          <div class="part-otp-field">
            <input
              name="otp"
              inputmode="numeric"
              autocomplete="one-time-code"
              :placeholder="I18n.get('wn-sign-in-otp-placeholder-otp')"
              v-model.trim="api.info.otp_val" />
            <button
              type="button"
              :class="{
                'is-cooling': api.Cooldown.value > 0,
                'is-sending': api.IsSending.value,
              }"
              :disabled="api.IsOtpButtonDisabled.value"
              @click="api.onClickGetOtp">
              <span v-if="api.Cooldown.value > 0">
                {{
                  I18n.getf("wn-sign-in-otp-form-cooldown", {
                    seconds: api.Cooldown.value,
                  })
                }}
              </span>
              <span v-else-if="api.IsSending.value">
                {{ I18n.get("wn-sign-in-otp-form-sending") }}
              </span>
              <span v-else>{{ I18n.get("wn-sign-in-otp-form-get-otp") }}</span>
            </button>
          </div>
        </dd>
      </dl>
      <!--
      提交按钮
      -->
      <dl>
        <button type="submit">
          {{ I18n.get("wn-signin-form-submit") }}
        </button>
      </dl>
      <!--
      错误信息
      -->
      <dl v-if="props.errCode">
        <div class="as-error">{{ I18n.get(props.errCode) }}</div>
      </dl>
    </form>
    <slot name="footer"></slot>
    <!--
      如果需要，这里显示人机验证码
    -->
    <div v-if="api.IsCaptchaVisible.value" class="part-captcha-mask">
      <div class="part-captcha-dialog">
        <div ref="captchaBox"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @use "./wn-sign-in-otp.scss";
</style>
