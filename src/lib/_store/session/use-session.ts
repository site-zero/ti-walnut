import { defineStore } from 'pinia';
import { SignInForm, UserSession, userGlobalStatusStore } from '../../';
import { Walnut } from '../../../core';
import { translateSessionResult } from './session-result';

export const useSessionStore = defineStore('session', {
  state: (): UserSession => ({
    env: {},
    ticket: 'xxx',
    me: {
      loginName: 'xxx',
      mainGroup: 'xxx',
    },
    loginAt: new Date(),
    expireAt: new Date(),
    homePath: 'xxx',
    theme: 'xxx',
    lang: 'xxx',
    errCode: undefined,
  }),
  actions: {
    async signIn(info: SignInForm) {
      const status = userGlobalStatusStore();
      try {
        status.processing = '正在执行登录';
        let re = await Walnut.signInToDomain(info);
        // Sign-in successfully
        if (re.ok) {
          let session = translateSessionResult(re.data);
          session.errCode = undefined;
          this.$patch(session);
        }
        // Sign-in Failed
        else {
          this.errCode = re.errCode;
        }
        console.log('signIn', re);
      } finally {
        status.processing = false;
      }
    },

    async reload() {
      const status = userGlobalStatusStore();
      try {
        status.loading = true;
        let re = await Walnut.fetchAjax('/a/me');
        if (re.ok) {
          let session = translateSessionResult(re.data);
          session.errCode = undefined;
          this.$patch(session);
        }
        // Outpu error
        else {
          this.$patch({
            ticket: undefined,
            me: undefined,
            errCode: undefined,
          });
        }
      } finally {
        status.loading = false;
      }
    },
  },
});
