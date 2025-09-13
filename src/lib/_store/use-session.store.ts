import { Alert, Gender, Str, Tmpl, Util, Vars, toGender } from "@site0/tijs";
import _ from "lodash";
import { computed, reactive, ref } from "vue";
import { SignInForm, useGlobalStatus } from "..";
import { Walnut } from "../../core";

/*
Read data from response:
{
  "ok": true,
  "data": {
    "id": "65hv47vrliha7qs0g8947j9mee",
    "ticket": "sa68cb0t2giofp6pgs54q14dj8",
    "parentTicket": "pd902mprqehbupepbl35r8gugg",
    "childTicket": null,
    "uid": "3vuek5r1vug1hrg3ui70uaiknp",
    "unm": "demo",
    "me": {
      "id": "3vuek5r1vug1hrg3ui70uaiknp",
      "loginName": "demo",
      "mainGroup": "walnut",
      "role": "user,robot,shenhe",
      "jobs": ["CH_NNLC"],
      "depts": ["HC", "CH", "CH_W", "CH_NN"],
      "nickname": "Demo User",
      "login": 1707324470690,
      "saltedPasswd": true,
      "roleInDomain": "GUEST"
    },
    "grp": "walnut",
    "by_tp": "auth_by_domain",
    "by_val": "u96lqi8032j44ra7tgpq9tero5:passwd",
    "expi": 1707410870978,
    "du": 86399985,
    "pwd": "~",
    "envs": {
      "SALTEDPASSWD": true,
      "ROLEINDOMAIN": "GUEST",
      "PWD": "/home/walnut/",
      "QUIT": "/a/login/",
      "ROLE": "user,robot,shenhe",
      "DEPT": "chispo,CH,CH_W,CH_NN",
      "JOBS": "CH_NNLC",
      "HOME": "/home/walnut/",
      "THEME": "light",
      "PATH": "/bin:/sbin:~/bin",
      "OPEN": "wn.manager",
      "APP_PATH": "/rs/ti/app:/app",
      "VIEW_PATH": "/mnt/project/chispo/view/:/rs/ti/view/",
      "SIDEBAR_PATH": "~/.ti/sidebar-crystal.json",
      "ENABLE_CONSOLE": "yes",
      "WWW_SITE_ID": "u96lqi8032j44ra7tgpq9tero5"
    }
  }
}
*/
export type UserSession = {
  ticket: string | undefined;
  parentTicket: string | undefined;
  childTicket: string | undefined;
  me: UserInfo | undefined;
  env: Vars;
  loginName: string | undefined;
  userId: string | undefined;
  mainGroup: string | undefined;
  mainRole: string | undefined;
  loginAt: Date | undefined;
  expireAt: Date | undefined;
  homePath: string | undefined;
  theme: string | undefined;
  lang: string | undefined;
  timezone?: string;
  errCode: string | undefined;
};

export type UserSessionApi = ReturnType<typeof useSessionStore>;

export type WnRole = "MEMBER" | "ADMIN" | "GUEST";

export type UserInfo = {
  loginName?: string;
  mainGroup?: string;
  role?: string[];
  nickname?: string;
  gender?: Gender;
  roleInOp?: WnRole;
  roleInDomain?: WnRole;
  sysAccount?: boolean;
  avatar?: string;
  meta?: Vars;
};

const SE = reactive({
  ticket: undefined,
  me: undefined,
  env: ref({}),
  loginAt: undefined,
  expireAt: undefined,
  homePath: undefined,
  loginName: undefined,
  userId: undefined,
  mainGroup: undefined,
  mainRole: undefined,
  theme: undefined,
  lang: undefined,
  errCode: undefined,
  timezone: "GMT+8",
}) as UserSession;

function _translate_session_result(data: any) {
  let env = data.envs || {};
  let me = data.me || {};
  // 角色，老版本可能是半角分隔字符串，新版本可能是数组
  let myRole = me.role;
  if (_.isString(myRole)) {
    myRole = Str.splitIgnoreBlank(myRole);
  }
  SE.ticket = data.ticket;
  SE.me = {
    loginName: data.unm || me.name || me.loginName || me.nm,
    mainGroup: data.grp || me.groupName || me.mainGroup || me.grp,
    role: myRole,
    gender: toGender(me.sex),
    nickname: me.nickname,
    roleInOp: me.roleInOp,
    roleInDomain: me.roleInDomain,
    sysAccount: me.sysAccount ? true : false,
    meta: me.meta || {},
  };
  SE.env = env;
  SE.mainGroup = data.grp || me.groupName || me.mainGroup || me.grp;
  SE.mainRole = data.mainRole;
  SE.userId = data.userId;
  SE.loginName = data.loginName;
  SE.loginAt = new Date(data.me.login || 0);
  SE.expireAt = new Date(data.expi || 0);
  SE.homePath = env["HOME"];
  SE.theme = env["THEME"];
  SE.lang = env["LANG"];
  SE.timezone = env["TIMEZONE"] || _.get(me.meta, "TIMEZONE");
}

export type SessionStore = ReturnType<typeof useSessionStore>;

/**
 * 创建并返回会话管理的 store。
 * 提供登录、登出、重置会话、获取对象路径和重新加载会话等功能。
 */
export function useSessionStore() {
  /**
   * 执行用户登录操作。
   *
   * **功能**：
   * - 使用提供的登录表单数据（用户名和密码）向 Walnut 服务器发起登录请求。
   * - 登录成功时，更新本地会话状态并执行回调函数（若提供）；失败时记录错误码。
   *
   * **参数**：
   * - `info: SignInForm` - 登录表单数据，包含 `username`（用户名）和 `password`（密码）。
   * - `afterOk?: () => Promise<void>` - 登录成功后执行的回调函数（可选），支持异步操作。
   *
   * **返回值**：
   * - 无显式返回值（异步函数，通过会话状态 `SE` 反映结果）。
   *
   * **设计动机**：
   * - 提供统一的登录入口，封装与 Walnut 服务器的交互逻辑，简化调用。
   * - 支持异步处理并通过 `useGlobalStatus` 显示处理状态，提升用户体验。
   * - 允许开发者在登录后执行自定义操作，例如跳转页面或加载数据。
   */
  async function signIn(info: SignInForm, afterOk: () => Promise<void>) {
    const _gl_sta = useGlobalStatus();
    try {
      _gl_sta.data.processing = "正在执行登录";
      let re = await Walnut.signInToDomain(info);
      // Sign-in successfully
      if (re.ok) {
        _translate_session_result(re.data);
        SE.errCode = undefined;
        if (afterOk) {
          await afterOk();
        }
      }
      // Sign-in Failed
      else {
        SE.errCode = re.errCode;
      }
      // console.log('signIn', re);
    } finally {
      _gl_sta.data.processing = false;
    }
  }

  /**
   * 重置会话状态到未登录状态。
   *
   * **功能**：
   * - 清空会话相关数据，包括 ticket、用户信息、环境变量等。
   *
   * **参数**：
   * - 无。
   *
   * **返回值**：
   * - 无。
   *
   * **设计动机**：
   * - 用于在会话失效（如登录失败、会话过期）时快速清除状态。
   * - 确保应用程序在异常情况下恢复到初始状态，提示用户重新登录。
   */
  function resetSession() {
    SE.ticket = undefined;
    SE.me = undefined;
    SE.env = {};
    SE.loginAt = undefined;
    SE.expireAt = undefined;
    SE.homePath = undefined;
    SE.theme = undefined;
    SE.lang = undefined;
    document.body.removeAttribute("session-ticket");
  }

  /**
   * 执行用户登出操作。
   *
   * **功能**：
   * - 向 Walnut 服务器发送登出请求。
   * - 登出成功时，若存在父会话则恢复到父会话状态，否则重置会话。
   *
   * **参数**：
   * - 无。
   *
   * **返回值**：
   * - 无显式返回值（异步函数，通过会话状态 `SE` 反映结果）。
   *
   * **设计动机**：
   * - 支持 Walnut 的嵌套会话特性，允许从模拟用户会话退回到父会话（如管理员会话）。
   * - 在无父会话时清空状态，确保登出后应用程序恢复到未登录状态。
   */
  async function signOut() {
    let re = await Walnut.signOut();
    if (re.ok) {
      if (re.data && re.data.parent) {
        _translate_session_result(re.data.parent);
        SE.errCode = undefined;
      }
      // Cancel Session
      else {
        resetSession();
      }
    }
  }

  async function switchSession(
    newTicket: string,
    exit: boolean,
    oldTicket?: string
  ) {
    let query = {} as Vars;
    query.seid = newTicket;
    if (exit) {
      query.exit = true;
    }
    if (oldTicket) {
      query.old_seid = oldTicket;
    }
    let re = await Walnut.fetchAjax("/u/ajax/chse", { query });
    if (re.ok) {
      _translate_session_result(re.data);
      Walnut.saveTicketToLocal(SE.ticket, SE.me?.meta?.TIMEZONE);
    }
    // 处理错误
    else {
      await Alert(`Fail to switchSession: ${JSON.stringify(re)}`, {
        type: "warn",
      });
    }
  }

  /**
   * 根据用户路径生成实际的对象路径。
   *
   * **功能**：
   * - 根据全局配置中的路径规则和当前会话上下文，生成实际的对象路径。
   * - 支持直接映射和条件路径选择， fallback 到默认规则。
   *
   * **参数**：
   * - `uPath: string` - 用户提供的路径字符串。
   *
   * **返回值**：
   * - `string` - 生成的实际对象路径。
   *
   * **设计动机**：
   * - 提供灵活的路径管理机制，适应 Walnut 系统中不同用户和环境的需求。
   * - 通过配置文件动态调整路径逻辑，无需硬编码，提升可维护性。
   */
  function getObjPath(hubPath: string): string {
    let aCtx: Vars = { path: hubPath, ...SE };
    let path = Walnut.findPath(hubPath, aCtx);

    if (!path) {
      throw "Fail to getObjPath: " + hubPath;
    }

    // 默认规则
    if (/^(~?\/)/.test(path)) {
      return hubPath;
    }
    return Util.appendPath("~", hubPath);
  }

  /**
   * 重新加载当前会话信息。
   *
   * **功能**：
   * - 从 Walnut 服务器获取最新会话数据并更新本地状态。
   * - 获取失败时重置会话状态。
   *
   * **参数**：
   * - `afterOk?: () => Promise<void>` - 加载成功后执行的回调函数（可选），支持异步操作。
   *
   * **返回值**：
   * - 无显式返回值（异步函数，通过会话状态 `SE` 反映结果）。
   *
   * **设计动机**：
   * - 保持本地会话与服务器同步，适用于会话可能变更的场景（如过期或修改）。
   * - 在失败时重置状态以便使用者可以有契机提示用户登录，增强安全性和一致性。
   */
  async function reload(afterOk: () => Promise<void>) {
    const status = useGlobalStatus();
    try {
      status.data.appLoading = true;
      let re = await Walnut.fetchMySession();
      if (re.ok) {
        _translate_session_result(re.data);
        SE.errCode = undefined;
        if (afterOk) {
          await afterOk();
        }
      }
      // Outpu error
      else {
        resetSession();
      }
    } finally {
      status.data.appLoading = false;
    }
  }

  return {
    data: SE,
    // ........................ Getters
    hasTicket: computed(() => (SE.ticket ? true : false)),
    // ........................ Actions
    getObjPath,
    signIn,
    signOut,
    resetSession,
    switchSession,
    reload,
  };
}
