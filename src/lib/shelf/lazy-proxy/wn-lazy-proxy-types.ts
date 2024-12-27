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
export type WnLazyProxyProps = CommonProps &
  ComRef & {
    /**
     * 代理控件的值
     */
    value?: any;

    /**
     * 指定了控件的那个属性用来接收“值”。
     * 如果未指定或者为 null，则不传递 value
     */
    autoValue?: string | null;

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
     * 是否需要加载。这是一个 AutoMatch，
     * 判断的目标就是 ProxiedComConf
     */
    needLoadContext?: any;

    /**
     * 异步读取上下文的方法。
     *
     * 如果是 string，就表示一个命令模板，控件会尝试渲染这个命令。
     * 命令的执行结果被认为是一个 JSON 对象，会直接转换为 Vars
     *
     * 否则就是一个直接可以调用的异步函数。
     *
     * 无论怎样，控件都需要给函数或者模板准备一个渲染上下文，
     * 这个上下文很简单，就是 props.vars
     *
     */
    loadContext?: string | LoadLazyContext;
  };

export type LoadLazyContext = (ctx: Vars) => Promise<Vars>;
