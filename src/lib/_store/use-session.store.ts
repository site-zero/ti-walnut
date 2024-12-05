import { Gender, Str, Vars, getLogger, toGender } from '@site0/tijs';
import { ComputedRef, Ref, computed, ref } from 'vue';
import { SignInForm, UserSidebar, useGlobalStatus } from '..';
import { Walnut } from '../../core';

const log = getLogger('wn.store.session');

/*
Read data from response:
{
  "ok": true,
  "data": {
    "id": "65hv47vrliha7qs0g8947j9mee",
    "ticket": "sa68cb0t2giofp6pgs54q14dj8",
    "pse_id": "pd902mprqehbupepbl35r8gugg",
    "uid": "3vuek5r1vug1hrg3ui70uaiknp",
    "unm": "demo",
    "me": {
      "id": "3vuek5r1vug1hrg3ui70uaiknp",
      "nm": "demo",
      "grp": "walnut",
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
  ticket: Ref<string | undefined>;
  me: Ref<UserInfo | undefined>;
  env: Ref<Vars>;
  loginAt: Ref<Date | undefined>;
  expireAt: Ref<Date | undefined>;
  homePath: Ref<string | undefined>;
  theme: Ref<string | undefined>;
  lang: Ref<string | undefined>;
  errCode: Ref<string | undefined>;
  sidebar: Ref<UserSidebar | undefined>;
};

export type UserSessionFeature = UserSession & {
  hasTicket: ComputedRef<boolean>;
  signIn: (info: SignInForm) => Promise<void>;
  signOut: () => Promise<void>;
  resetSession: () => void;
  reload: () => Promise<void>;
};

export type WnRole = 'MEMBER' | 'ADMIN' | 'GUEST';

export type UserInfo = {
  loginName: string;
  mainGroup: string;
  role?: string[];
  nickname?: string;
  gender?: Gender;
  jobs?: string[];
  depts?: string[];
  roleInOp?: WnRole;
  roleInDomain?: WnRole;
  sysAccount?: boolean;
  avatar?: string;
};

const SE = {
  ticket: ref(),
  me: ref(),
  env: ref({}),
  loginAt: ref(),
  expireAt: ref(),
  homePath: ref(),
  theme: ref(),
  lang: ref(),
  errCode: ref(),
  sidebar: ref(),
} as UserSession;

function _translate_session_result(data: any) {
  let env = data.envs || {};
  let me = data.me || {};
  SE.ticket.value = data.ticket;
  SE.me.value = {
    loginName: data.unm || me.name,
    mainGroup: data.grp || me.groupName,
    role: Str.splitIgnoreBlank(me.role),
    gender: toGender(me.sex),
    nickname: me.nickname,
    jobs: me.jobs,
    depts: me.depts,
    roleInOp: me.roleInOp,
    roleInDomain: me.roleInDomain,
    sysAccount: me.sysAccount ? true : false,
  };
  SE.env.value = env;
  SE.loginAt.value = new Date(data.me.login || 0);
  SE.expireAt.value = new Date(data.expi || 0);
  SE.homePath.value = env['HOME'];
  SE.theme.value = env['THEME'];
  SE.lang.value = env['LANG'];
}

export function useSessionStore(): UserSessionFeature {
  async function signIn(info: SignInForm) {
    const status = useGlobalStatus();
    try {
      status.processing = '正在执行登录';
      let re = await Walnut.signInToDomain(info);
      // Sign-in successfully
      if (re.ok) {
        _translate_session_result(re.data);
        SE.errCode.value = undefined;
        SE.sidebar.value = undefined;
        log.info('signIn OK, so fetchSidebar');
        SE.sidebar.value = await Walnut.fetchSidebar();
      }
      // Sign-in Failed
      else {
        SE.errCode.value = re.errCode;
      }
      console.log('signIn', re);
    } finally {
      status.processing = false;
    }
  }

  function resetSession() {
    SE.ticket.value = undefined;
    SE.me.value = undefined;
    SE.env.value = {};
    SE.loginAt.value = undefined;
    SE.expireAt.value = undefined;
    SE.homePath.value = undefined;
    SE.theme.value = undefined;
    SE.lang.value = undefined;
  }

  async function signOut() {
    log.info('sign out');
    let re = await Walnut.signOut();
    log.info(re);
    if (re.ok) {
      if (re.data && re.data.parent) {
        _translate_session_result(re.data.parent);
        SE.errCode.value = undefined;
        SE.sidebar.value = undefined;
        log.info('signOut with parent session, so fetchSidebar');
        SE.sidebar.value = await Walnut.fetchSidebar();
      }
      // Cancel Session
      else {
        log.info('signOut, resetSession');
        resetSession();
      }
    }
  }

  async function reload() {
    const status = useGlobalStatus();
    try {
      status.appLoading = true;
      let re = await Walnut.fetchMySession();
      if (re.ok) {
        _translate_session_result(re.data);
        SE.errCode.value = undefined;
        SE.sidebar.value = undefined;
        log.info('reload with session, so fetchSidebar');
        SE.sidebar.value = await Walnut.fetchSidebar();
      }
      // Outpu error
      else {
        resetSession();
      }
    } finally {
      status.appLoading = false;
    }
  }

  return {
    ...SE,
    // ........................ Getters
    hasTicket: computed(() => (SE.ticket.value ? true : false)),
    // ........................ Actions
    signIn,
    signOut,
    resetSession,
    reload,
  };
}
