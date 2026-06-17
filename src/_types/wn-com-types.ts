import { ThumbProps } from '@site0/tijs';
import { WnObj } from './wn-types';

export type WnObjInput = string | WnObj;

/**
 * 这里的值是一个 WnObj，支持下面几种表现形式:
 *
 * ## 直接对象
 * - `obj`：一个 WnObj 对象，我们关注它的 id|nm|title|thumb|icon 属性
 *         这种对象可以直接用来显示
 *
 * ## 字符串形值，我们需要自动异步获取
 * - `id`：一个 WnObj 对象的 id
 * - `idPath`：一个 WnObj 对象的 idPath，类似'id:xxxx' 【默认】
 * - `path`：一个 WnObj 对象的 path，类似'~/xxx/xxx'
 */
export type WnObjInputType = 'obj' | 'id' | 'idPath' | 'path';

export type ObjUploadItem = ThumbProps & {
  index: number;
  file: File;
  progress: number;
  abort: AbortController | null;
  newObj?: WnObj;
};
