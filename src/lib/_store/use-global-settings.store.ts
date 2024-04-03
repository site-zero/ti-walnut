import { defineStore } from 'pinia';
import { GlobalSettings } from '..';

export const userGlobalSettingsStore = defineStore('settings', {
  state: (): GlobalSettings => ({
    exposeHidden: false,
  }),
});
