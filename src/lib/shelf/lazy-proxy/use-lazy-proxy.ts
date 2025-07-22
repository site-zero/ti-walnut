import { Match, Tmpl, Util, Vars } from '@site0/tijs';
import _ from 'lodash';
import { ref } from 'vue';
import { Walnut } from '../../../core';
import { WnLazyProxyProps } from './wn-lazy-proxy-types';

/**
 * 为延迟代理创建并提供工具函数。
 *
 * @param props - 用于配置代理行为的参数，其类型为 WnLazyProxyProps。
 *                包含上下文加载逻辑、变量、组合配置等配置信息。
 * @returns 返回一个对象，包含以下属性：
 *  - _com_conf_update: 响应式引用，用于存储上下文配置的更新值。
 *  - needLoadContext: 函数，根据条件判断是否需要加载新的上下文。
 *  - loadContext: 异步函数，用于加载上下文配置；根据 props.loadContext 的类型，
 *                 可以是默认的空操作、命令模板解析或自定义加载逻辑。
 *  - buildComConf: 函数，用于构建并返回最终的组合配置对象，根据
 *                 props.comConf、props.vars 以及 _com_conf_update 的值进行合并与处理，
 *                 同时支持自动补充值的功能。
 *
 * 该函数支持三种上下文加载方式：
 * 1. 默认方式：重置 _com_conf_update。
 * 2. 命令模板方式：当 props.loadContext 为字符串时，解析命令模板后执行命令并解析结果。
 * 3. 定制方式：当 props.loadContext 为函数时，直接使用该函数加载上下文。
 */
export function useLazyProxy(props: WnLazyProxyProps) {
  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const _com_conf_update = ref<Vars>();
  //-----------------------------------------------------
  // 默认行为
  //-----------------------------------------------------
  let _am = Match.parse(props.needLoadContext, false);
  const needLoadContext = (comConf: Vars) => _am.test(comConf);
  //-----------------------------------------------------
  let loadContext = async () => {
    _com_conf_update.value = undefined;
  };
  // 采用命令模板
  if (_.isString(props.loadContext)) {
    let cmdTmpl = Tmpl.parse(props.loadContext);
    loadContext = async () => {
      let cmdText = cmdTmpl.render(props.vars ?? {});
      let re = await Walnut.exec(cmdText, { as: 'json' });
      if (re) {
        _com_conf_update.value = re as Vars;
      }
    };
  }
  // 完全定制的上下文加载逻辑
  else if (props.loadContext) {
    const __load_content = props.loadContext;
    loadContext = async () => {
      _com_conf_update.value = await __load_content(props.vars ?? {});
    };
  }
  //-----------------------------------------------------
  const buildComConf = () => {
    let re: Vars;
    if (props.dynamic) {
      let ctx = _.assign({}, props.vars, _com_conf_update.value);
      re = Util.explainObj(ctx, props.comConf ?? {});
    } else {
      re = Util.jsonClone(props.comConf) ?? {};
    }
    // 自动补充值
    if (props.autoValue && !_.isUndefined(props.value)) {
      re[props.autoValue] = props.value;
    }
    return re;
  };
  //-----------------------------------------------------
  // 输出特性
  //-----------------------------------------------------
  return {
    _com_conf_update,
    needLoadContext,
    loadContext,
    buildComConf,
  };
}
