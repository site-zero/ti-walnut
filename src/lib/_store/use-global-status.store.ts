import { Ref, reactive, ref } from 'vue';

export type GlobalStatus = {
  appLoading: Ref<boolean | string>;
  loading: Ref<boolean | string>;
  saving: Ref<boolean | string>;
  removing: Ref<boolean | string>;
  processing: Ref<boolean | string>;
  changed: Ref<boolean>;
  exposeHidden: Ref<boolean>;
};

export type GlobalStatueFeature = {
  set: (key: keyof GlobalStatus, val: boolean | string) => void;
  reset: (key: keyof GlobalStatus) => void;
  get: (key: keyof GlobalStatus) => boolean | string;
  is: (key: keyof GlobalStatus) => boolean;
};

const STATUS = {
  appLoading: ref(false),
  loading: ref(false),
  saving: ref(false),
  removing: ref(false),
  processing: ref(false),
  changed: ref(false),
} as GlobalStatus;

export function userGlobalStatusStore(): GlobalStatueFeature {
  return {
    set: (key: keyof GlobalStatus, val: boolean | string) => {
      STATUS[key].value = val;
    },
    reset: (key: keyof GlobalStatus) => {
      return (STATUS[key].value = false);
    },
    get: (key: keyof GlobalStatus): boolean | string => {
      return STATUS[key].value;
    },
    is: (key: keyof GlobalStatus): boolean => {
      return STATUS[key].value ? true : false;
    },
  };
}
