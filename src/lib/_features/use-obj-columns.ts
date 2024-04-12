import { TableCell, getFieldUniqKey, getLogger } from '@site0/tijs';
import _ from 'lodash';
import { READONLY_FIELDS } from './define-obj-columns';

const log = getLogger('wn.feature.obj-columns');

export type ObjColumnsFeature = {
  getColumn: (key: string) => TableCell;
  getColumns: (key: string[]) => TableCell[];
  addColumn: (col: TableCell, override: boolean) => void;
};

export function useObjColumns() {
  function getColumn(key: string) {
    let col = READONLY_FIELDS.get(key);
    if (col) {
      return col;
    }
    log.warn(`field [${key}] not Exists!`);
  }

  function getColumns(keys: string[]): TableCell[] {
    console.log(keys);
    let cells = [] as TableCell[];
    for (let key of keys) {
      let col = getColumn(key);
      if (col) {
        cells.push(col);
      }
    }
    return cells;
  }

  function addColumn(col: TableCell, override = false) {
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
