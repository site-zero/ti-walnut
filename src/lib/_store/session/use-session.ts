import { defineStore } from "pinia";
import { UserSession } from "../../";
import { Walnut } from "../../../core";

export const useSessionStore = defineStore("session", {
  state: (): UserSession => ({
    ticket: "xxx",
    me: {
      loginName: "xxx",
      mainGroup: "xxx",
      role: "xxx",
      loginAt: new Date(),
      homePath: "xxx",
      theme: "xxx",
      lang: "xxx"
    }
  }),
  actions: {
    async reload() {
      let re = await Walnut.fetchAjax("a/me");
      if (re.ok) {
        // TODO 更新
      }
      // Outpu error
      else {
        this.$patch({
          ticket: undefined,
          me: undefined
        });
        console.error(re);
      }
    }
  }
});
