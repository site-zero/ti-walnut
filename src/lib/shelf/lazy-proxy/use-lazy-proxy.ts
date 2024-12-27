import { Match, Tmpl, Util, Vars } from '@site0/tijs';
import _ from 'lodash';
import { ref } from 'vue';
import { Walnut } from '../../../core';
import { WnLazyProxyProps } from './wn-lazy-proxy-types';

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
    let comConf = props.comConf ?? {};
    if (props.dynamic) {
      let ctx = _.assign({}, props.vars, _com_conf_update.value);
      re = Util.explainObj(ctx, props.comConf ?? {});
    } else {
      re = _.cloneDeep(props.comConf) ?? {};
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
