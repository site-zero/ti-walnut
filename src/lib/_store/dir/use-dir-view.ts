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
  const { actionPath, layoutPath, schemaPath, methodPaths } = options;
  const _view: DirViewSettings = {
    pvg: ref({}),
    guiShown: ref(),
    actions: ref(),
    layout: ref({ blocks: [] }),
    schema: ref({}),
    methods: ref({}),
  };

  //-------------------------------------
  //            Computed
  //--------------------------------------

  //-------------------------------------
  //             Methods
  //-------------------------------------

  async function loadActions() {
    if (actionPath.value) {
      log.debug('loadActions:', actionPath.value);
      _view.actions.value = await Walnut.loadJson(actionPath.value);
    } else {
      _view.actions.value = undefined;
      log.debug('loadActions: NOT Need');
    }
  }

  async function loadLayout() {
    if (layoutPath.value) {
      log.debug('loadLayout:', layoutPath.value);
      _view.layout.value = await Walnut.loadJson(layoutPath.value);
    } else {
      _view.layout.value = (() => ({ blocks: [] }))();
      log.debug('loadLayout: NOT Need');
    }
  }

  async function loadScheme() {
    if (schemaPath.value) {
      log.debug('loadScheme:', schemaPath.value);
      _view.schema.value = await Walnut.loadJson(schemaPath.value);
    } else {
      _view.schema.value = (() => ({}))();
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
      _view.methods.value = re;
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
        pageNumber: 1,
        pageSize: 20,
        pageCount: 0,
        totalCount: 0,
        count: 0,
        // skip: 0,
        // limit: 20,
      };
    }
  }

  return {
    /*-----------<State>---------------*/
    ..._view,
    /*-----------<Getters>---------------*/
    hasActions: computed(() => {
      return !_.isEmpty(_view.actions.value);
    }),
    /*-----------<Actions>---------------*/
    resetView: () => {
      log.debug('resetView');
      _view.pvg.value = {};
      _view.guiShown.value = {};
      _view.actions.value = undefined;
      _view.layout.value = (() => ({ blocks: [] }))();
      _view.schema.value = (() => ({}))();
      _view.methods.value = {};
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
      _view.guiShown.value = shown;
    },
    mergeShown: (shown: Vars) => {
      if (!_view.guiShown.value) {
        _view.guiShown.value = {};
      }
      _.assign(_view.guiShown.value, shown);
    },
    invoke: async (methodName: string, ...args: any[]): Promise<any> => {
      let fn = _view.methods.value[methodName];
      if (_.isFunction(fn)) {
        let re = await fn(...args);
        return re;
      }
      // Warn
      else {
        log.error(
          `Not Function [${methodName}] of methods:`,
          _view.methods.value
        );
      }
    },
  };
}
