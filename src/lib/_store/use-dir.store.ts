import { ShortNamePager, Vars } from '@site0/tijs';
import { defineStore } from 'pinia';
import { CurrentDirState } from './support/dir.type';
import { WnObj } from '..';

export function defineDirStore(name: string = 'CurrentDir') {
  return defineStore(name, {
    state: () =>
      ({
        moduleName: name,
        localBehaviorKeepAt: '->WnObj-State-${dirId}',
        exportSettings: {},
        importSettings: {},
        lbkOff: false,
        filter: {},
        sorter: { nm: -1 } as Vars,
        list: [] as WnObj[],
        pager: {
          pn: 1,
          pgsz: 50,
          pgc: 0,
          sum: 0,
          skip: 0,
          count: 0,
        } as ShortNamePager,
        content: null,
        __saved_content: null,
        contentPath: '<self>',
        contentType: '<MIME>',
        contentQuietParse: false,
        fieldStatus: {},
        itemStatus: {},
        guiShown: {},
      } as CurrentDirState),
    getters: {},
    actions: {},
  });
}
