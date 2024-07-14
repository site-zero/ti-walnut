import { TableInputColumn, getFieldUniqKey, getLogger } from '@site0/tijs';
import _ from 'lodash';
import { READONLY_FIELDS } from './define-obj-columns';

const log = getLogger('wn.obj-columns');

export type ObjColumnsFeature = {
  getColumn: (key: string) => TableInputColumn;
  getColumns: (key: string[]) => TableInputColumn[];
  addColumn: (col: TableInputColumn, override: boolean) => void;
};

export function useObjColumns() {
  function getColumn(key: string) {
    let col = READONLY_FIELDS.get(key);
    if (col) {
      return col;
    }
    log.warn(`field [${key}] not Exists!`);
  }

  function getColumns(keys: string[]): TableInputColumn[] {
    log.debug('getColumns', keys);
    let cells = [] as TableInputColumn[];
    for (let key of keys) {
      let col = getColumn(key);
      if (col) {
        cells.push(col);
      }
    }
    return cells;
  }

  function addColumn(col: TableInputColumn, override = false) {
    let key = getFieldUniqKey(col.name);
    if (READONLY_FIELDS.has(key) && !override) {
      throw `Field [${key}] Exists`;
    }
    READONLY_FIELDS.set(key, _.cloneDeep(col));
  }

  return {
    getColumn,
    getColumns,
    addColumn,
  };
}
