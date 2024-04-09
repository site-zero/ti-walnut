import { defineStore } from 'pinia';
import { ref } from 'vue';

export const userGlobalStatusStore = defineStore('status_abc', () => {
  console.log('defineStore("status")');
  return {
    loading: ref<string | boolean>(false),
    saving: ref<string | boolean>(false),
    removing: ref<string | boolean>(false),
    processing: ref<string | boolean>(false),
    changed: ref<string | boolean>(false),
  };
});
