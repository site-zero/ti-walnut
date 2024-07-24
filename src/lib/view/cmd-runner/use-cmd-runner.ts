import { DateTime, Tmpl } from '@site0/tijs';
import JSON5 from 'json5';
import { computed, Ref } from 'vue';
import { Walnut } from '../../../core';
import { WnCmdRunnerEmitter, WnCmdRunnerProps } from './wn-cmd-runner-types';
import _ from 'lodash';
//-----------------------------------------------------
export type WnCmdRunnerOptions = {
  emit: WnCmdRunnerEmitter;
  _lines: Ref<string[]>;
  _processing: Ref<boolean>;
  _duration: Ref<number>;
};
//-----------------------------------------------------
export function useCmdRunner(
  props: WnCmdRunnerProps,
  options: WnCmdRunnerOptions
) {
  let { emit, _lines, _processing, _duration } = options;

  const _dft_command = computed(() => {
    if (!props.command) {
      return 'echo `-NO COMMAND-`';
    }
    if (props.vars) {
      let str = Tmpl.exec(props.command, props.vars, false);
      return str;
    }
    return props.command;
  });
  //-----------------------------------------------------
  function appendInfo(info?: string | string[]) {
    if (!info) {
      return;
    }
    let list = _.concat(info);
    for (let li of list) {
      _lines.value.push(li);
    }
  }
  //-----------------------------------------------------
  async function exec(input?: string) {
    let cmdText = input ?? _dft_command.value;
    let beginInMs = Date.now();
    let du = 0;
    try {
      appendInfo(`~:> ${cmdText}`);
      _processing.value = true;
      let re = await Walnut.exec(cmdText, { input: props.input });
      _processing.value = false;
      let lines = _.trim(re).split(/\r?\n/g);
      du = Date.now() - beginInMs;
      let duText = DateTime.parseTime(du).toString();
      appendInfo(lines);
      appendInfo([props.epilog, duText].join(' : '));
      let payload = re;
      if ('json' == props.sucessAs) {
        payload = JSON5.parse(re);
      }
      emit('success', payload);
    } catch (err: any) {
      console.warn('command error', err);
      emit('fail', err);
    }
    emit('finished');
    _duration.value = du;
  }
  //-----------------------------------------------------
  async function reload() {
    appendInfo(props.preface);
    await exec();
  }
  //-----------------------------------------------------
  //  输出特性
  //-----------------------------------------------------
  return {
    _dft_command,
    reload,
    exec,
  };
}
