import { toWnUserRace, useSessionStore } from "@site0/ti-walnut";
import { computed } from "vue";
import { do_change_password, sign_in_by_another_user } from "./support";
import { WnHubSessionEmitter, WnHubSessionProps } from "./wn-hub-session-types";

export type WnHubSessionApi = ReturnType<typeof useWnHubSessionApi>;

export function useWnHubSessionApi(
  props: WnHubSessionProps,
  _emit: WnHubSessionEmitter
) {
  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const session = useSessionStore();
  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const isLoggedIn = computed(() => !!session.hasTicket.value);
  const UserName = computed(() => {
    return session.data.me?.nickname || session.data.me?.loginName || "???";
  });
  const UserRace = computed(() => {
    let user_race = session.data.me?.userRace;
    if (user_race) {
      return toWnUserRace(user_race);
    }
  });
  //--------------------------------------------------
  const isAdmin = computed(() => {
    return session.data.mainRole == props.adminRole;
  });
  //-----------------------------------------------------
  const CanSignInByAnotherUser = computed(() => isAdmin.value);
  //-----------------------------------------------------
  // 数据改动
  //-----------------------------------------------------

  //-----------------------------------------------------
  // 远程操作
  //-----------------------------------------------------
  async function signInByAnotherUser() {
    await sign_in_by_another_user({
      loginSitePath: props.loginSitePath,
      isAdmin: () => isAdmin.value,
    });
  }
  //-----------------------------------------------------
  async function doChangePassword() {
    await do_change_password({
      getMe: () => session.data.me,
      loginSitePath: props.loginSitePath,
    });
  }
  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    // 计算属性
    isLoggedIn,
    UserName,
    UserRace,
    isAdmin,
    CanSignInByAnotherUser,
    // 远程操作
    signInByAnotherUser,
    doChangePassword,
  };
}
