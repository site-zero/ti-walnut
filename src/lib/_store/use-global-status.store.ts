import { defineStore } from 'pinia';
import { GlobalStatus } from '..';

export const userGlobalStatusStore = defineStore('status', {
  state: (): GlobalStatus => ({
    loading: false,
    saving: false,
    removing: false,
    processing: false,
    changed: false,
  }),
});
