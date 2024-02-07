import { Str } from '@site0/tijs';
import { UserSession } from '../../';

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
export function translateSessionResult(data: any): UserSession {
  let env = data.envs || {};
  return {
    env,
    ticket: data.ticket,
    loginAt: new Date(data.me.login || 0),
    expireAt: new Date(data.expi || 0),
    homePath: env['HOME'],
    theme: env['THEME'],
    lang: env['LANG'],
    me: {
      loginName: data.unm,
      mainGroup: data.grp,
      role: Str.splitIgnoreBlank(data.me.role),
      nickname: data.me.nickname,
      jobs: data.me.jobs,
      depts: data.me.depts,
      roleInOp: data.me.roleInOp,
      roleInDomain: data.me.roleInDomain,
    },
  };
}
