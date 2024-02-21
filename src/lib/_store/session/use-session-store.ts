import { defineStore } from 'pinia';
import { SignInForm, UserSessionState, userGlobalStatusStore } from '../..';
import { Walnut } from '../../../core';
import { translateSessionResult } from './session-result';

export const useSessionStore = defineStore('session', {
  state: (): UserSessionState => ({
    env: {},
    ticket: undefined,
    me: undefined,
    loginAt: undefined,
    expireAt: undefined,
    homePath: undefined,
    theme: undefined,
    lang: undefined,
    errCode: undefined,
    sidebar: undefined,
  }),
  getters: {
    hasTicket(state): boolean {
      return state.ticket ? true : false;
    },
  },
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
          console.log('有会话，读侧边栏');
          session.sidebar = await Walnut.fetchSidebar();
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

    async signOut() {
      console.log('sign out');
      let re = await Walnut.signOut();
      console.log(re);
      if (re.ok) {
        if (re.data && re.data.parent) {
          let session = translateSessionResult(re.data.parent);
          session.errCode = undefined;
          console.log('有会话，读侧边栏');
          session.sidebar = await Walnut.fetchSidebar();
          this.$patch(session);
        }
        // Cancel Session
        else {
          this.resetSession();
        }
      }
    },

    resetSession(): void {
      this.$patch({
        env: {},
        ticket: undefined,
        me: undefined,
        loginAt: undefined,
        expireAt: undefined,
        homePath: undefined,
        theme: undefined,
        lang: undefined,
        errCode: undefined,
        sidebar: undefined,
      });
    },

    async reload() {
      const status = userGlobalStatusStore();
      try {
        status.loading = true;
        let re = await Walnut.fetchMySession();
        if (re.ok) {
          let session = translateSessionResult(re.data);
          session.errCode = undefined;
          console.log('有会话，读侧边栏');
          session.sidebar = await Walnut.fetchSidebar();
          this.$patch(session);
        }
        // Outpu error
        else {
          this.resetSession()
        }
      } finally {
        status.loading = false;
      }
    },
  },
});
