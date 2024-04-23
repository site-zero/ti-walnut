import { Vars, getLogger } from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import { Walnut } from '../../../core';
import {
  DirAggSettings,
  DirGUIViewBehaviors,
  DirInitFeature,
  DirQuerySettings,
  DirViewFeatures,
  DirViewSettings,
} from './dir.type';

const log = getLogger('wn.store.dir.view');

export function useDirView(options: DirInitFeature): DirViewFeatures {
  let { actionsPath, layoutPath, schemaPath, methodPaths } = options;
  let VIEW: DirViewSettings = {
    pvg: ref({}),
    guiShown: ref(),
    actions: ref(),
    layout: ref(),
    schema: ref(),
    methods: ref({}),
  };

  /*-------------------------------------

                Computed

  --------------------------------------*/
  let GuiLayout = computed(() => {
    return;
  });

  /*-------------------------------------

                Methods

  --------------------------------------*/

  async function loadActions() {
    if (actionsPath.value) {
      log.debug('loadActions:', actionsPath.value);
      VIEW.actions.value = await Walnut.loadJson(actionsPath.value);
    } else {
      log.debug('loadActions: NOT Need');
    }
  }

  async function loadLayout() {
    if (layoutPath.value) {
      log.debug('loadLayout:', layoutPath.value);
      VIEW.layout.value = await Walnut.loadJson(layoutPath.value);
    } else {
      log.debug('loadLayout: NOT Need');
    }
  }

  async function loadScheme() {
    if (schemaPath.value) {
      log.debug('loadScheme:', schemaPath.value);
      VIEW.schema.value = await Walnut.loadJson(schemaPath.value);
    } else {
      log.debug('loadScheme: NOT Need');
    }
  }

  async function loadMethods() {
    if (methodPaths.value) {
      let loadedMethods = [] as any[];
      let loadings = [] as Promise<void>[];
      async function _load_(path: string) {
        let jsPath = Walnut.cookPath(path);
        let re = await Walnut.loadJsModule(jsPath);
        loadedMethods.push(re);
      }
      for (let path of methodPaths.value) {
        log.debug('loadMethods:', path);
        loadings.push(_load_(path));
      }

      let re = {} as Record<string, Function>;
      if (!_.isEmpty(loadings)) {
        await Promise.all(loadings);
        for (let loaded of loadedMethods) {
          _.assign(re, loaded);
        }
      }
      VIEW.methods.value = re;
    } else {
      log.debug('loadMethods: NOT Need');
    }
  }

  function applyView(
    be: DirGUIViewBehaviors,
    settings: DirQuerySettings & DirAggSettings
  ) {
    if (be.fixedMatch) {
      settings.fixedMatch.value = _.cloneDeep(be.fixedMatch);
    }
    if (be.filter) {
      settings.filter.value = _.cloneDeep(be.filter);
    }
    if (be.sorter) {
      settings.sorter.value = _.cloneDeep(be.sorter);
    }
    if (be.joinOne) {
      settings.joinOne.value = _.cloneDeep(be.joinOne);
    }
    if (be.pager) {
      settings.pager.value = _.cloneDeep(be.pager);
    } else {
      settings.pager.value = {
        pn: 1,
        pgsz: 20,
        pgc: 0,
        sum: 0,
        count: 0,
        skip: 0,
        limit: 20,
      };
    }
  }

  return {
    /*-----------<State>---------------*/
    ...VIEW,
    /*-----------<Getters>---------------*/

    /*-----------<Actions>---------------*/
    resetView: () => {
      log.debug('resetView');
      VIEW.pvg.value = {};
      VIEW.guiShown.value = {};
      VIEW.actions.value = undefined;
      VIEW.layout.value = undefined;
      VIEW.schema.value = undefined;
      VIEW.methods.value = {};
    },
    loadView: async () => {
      let loading = [] as any[];
      loading.push(loadActions());
      loading.push(loadLayout());
      loading.push(loadScheme());
      loading.push(loadMethods());
      await Promise.all(loading);
    },
    applyView,
    can_I_remove: () => true,
    can_I_create: () => true,
    can_I_update: () => true,
    can_I_save: () => true,
    updateShown: (shown: Vars) => {
      VIEW.guiShown.value = shown;
    },
    mergeShown: (shown: Vars) => {
      if (!VIEW.guiShown.value) {
        VIEW.guiShown.value = {};
      }
      _.assign(VIEW.guiShown.value, shown);
    },
    invoke: async (methodName: string, ...args: any[]): Promise<any> => {
      let fn = VIEW.methods.value[methodName];
      if (_.isFunction(fn)) {
        let re = await fn(...args);
        return re;
      }
      // Warn
      else {
        log.error(
          `Not Function [${methodName}] of methods:`,
          VIEW.methods.value
        );
      }
    },
  };
}
