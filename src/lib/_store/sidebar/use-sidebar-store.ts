import { defineStore } from 'pinia';
import { Walnut } from '../../../core';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({}),
  actions: {
    async reload() {
      console.log('reload sidebar');
      let re = await Walnut.exec('cat ~/.tmp/aa.txt');
      console.log(re);
    },
  },
});
