import { computed, onBeforeUnmount, ref } from "vue";
import type { WnSignInOTPProps } from "../wn-sign-in-otp-types";

const DEFAULT_OTP_COOLDOWN = 60;
const COOLDOWN_TICK = 1000;

//-----------------------------------------------------
export function useWnSignInOTPCooldown(props: WnSignInOTPProps) {
  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const _cooldown = ref(0);
  const _is_sending = ref(false);

  let _cooldown_timer: number | undefined;

  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const Cooldown = computed(() => _cooldown.value);
  const IsSending = computed(() => _is_sending.value);
  const IsActive = computed(() => _cooldown.value > 0);

  //-----------------------------------------------------
  // 数据改动
  //-----------------------------------------------------
  function _clear_cooldown_timer() {
    if (_cooldown_timer !== undefined) {
      window.clearInterval(_cooldown_timer);
      _cooldown_timer = undefined;
    }
  }

  //-----------------------------------------------------
  function startCooldown() {
    _clear_cooldown_timer();
    const seconds = Math.max(
      0,
      Math.floor(props.otpCooldown ?? DEFAULT_OTP_COOLDOWN)
    );
    _cooldown.value = seconds;
    if (seconds <= 0) {
      return;
    }
    _cooldown_timer = window.setInterval(() => {
      _cooldown.value -= 1;
      if (_cooldown.value <= 0) {
        _clear_cooldown_timer();
      }
    }, COOLDOWN_TICK);
  }

  //-----------------------------------------------------
  function startSending() {
    _is_sending.value = true;
  }

  //-----------------------------------------------------
  function stopSending() {
    _is_sending.value = false;
  }

  //-----------------------------------------------------
  function resetCooldown() {
    _clear_cooldown_timer();
    _cooldown.value = 0;
    stopSending();
  }

  //-----------------------------------------------------
  // 生命周期
  //-----------------------------------------------------
  onBeforeUnmount(() => {
    resetCooldown();
  });

  //-----------------------------------------------------
  // 暴露接口
  //-----------------------------------------------------
  return {
    // 计算属性
    Cooldown,
    IsSending,
    IsActive,
    // 数据改动
    startCooldown,
    startSending,
    stopSending,
    resetCooldown,
  };
}
