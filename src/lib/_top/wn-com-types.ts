import { IconInput } from '@site0/tijs';
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
 * - `idPath`：一个 WnObj 对象的 idPath，类似'id:xxxx'
 * - `path`：一个 WnObj 对象的 path，类似'~/xxx/xxx'
 * - `auto`: 【默认】自动根据值的类型判判断，如果是对象就是 'obj' 否则就看字符串
 *     - id:xxxx 就是  'idPath'
 *     - ~/path/to/obj 就是 'path'
 *     - 其他就是 'id'
 */
export type WnObjInputType = 'obj' | 'id' | 'idPath' | 'path'| 'auto';
