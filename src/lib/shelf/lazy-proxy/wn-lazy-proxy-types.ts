import { CommonProps, ComRef, Vars } from '@site0/tijs';

/**
 * 这个对象就是一个包裹器，用来简化一些异步内容。
 *
 * 譬如我有一个对象，它的内容是一个比较大的 HTML 长文档。
 * 我在列表聚焦了一个对象，右侧详情页面，我需要显示这个 HTML
 *
 * 我假设 obj.conent 字段存放这个 HTML，为了效率，我显然不应该
 * 在查询列表时包括这个字段，但是当用户点击到详情页时，我会判断
 * 一下，譬如 content 为空，且 len>0 那么必然说明有内容，
 *
 * 因此就异步加载，成功后，将加载的内容设置给详情。
 *
 * 有了这个对象，中间的逻辑就可以统一写在一起了
 */
export type WnLazyProxy = CommonProps &
  ComRef & {
    /**
     * 过为 true，那么 comConf 就是一个模板，需要用
     * vars 作为上下文，执行 explain
     */
    dynamic?: true;

    /**
     * 如果是 dynamic 那么这个变量作为 explain 的上下文
     */
    vars?: Vars;

    /**
     * 是否需要加载。当控件被加载或者 comType/comConf
     * 变化时，会被使用，用来判断是否有需要加载的数据
     *
     * 判断的依据，在 dynamic 为 true 时，采用 vars 段
     * 否则，采用 comConf 段
     *
     * @param comConfOrVars 判断的依据上下文
     * @returns 是否需要重新加载
     */
    needReload?: (comConfOrVars: Vars) => boolean;

    /**
     * 异步读取上下文的方法。
     *
     * 如果是 string，就表示一个命令，这个命令会尝试采用
     * vars 作为上下文模板来渲染一下。这个命令的执行结果
     * 被认为应该是一个 json 对象
     *
     * 否则就是一个直接可以调用的异步函数。
     *
     * 无论怎样，加载的时候，会采用下面的逻辑:
     *
     * ```
     * - dynamic == true
     *    - ComConf = explainObj(vars, props.comConf)
     *    - update = loadContext(vars)
     * - dynamic == false
     *    - ComConf = props.comConf
     *    - update = loadContext(_.assign({},props.comConf,props.vars})
     * ```
     */
    loadContext?: string | LoadLazyContext;

    /**
     * 提供一个更新 comConf 的方法，默认就是 `_.assign`
     *
     * @param oldConf 输入的 comConf
     * @param update 加载后，用来更新的 comConf
     */
    updateComConf?: (oldConf: Vars, update: Vars) => void;
  };

export type LoadLazyContext = (comConfOrVars: Vars) => Promise<Vars>;
