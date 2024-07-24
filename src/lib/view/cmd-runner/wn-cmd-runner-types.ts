import { Vars } from '@site0/tijs';

export type WnCmdRunnerEmitter = {
  (event: 'success', payload: any): void;
  (event: 'fail', payload: any): void;
  (event: 'finished'): void;
};

export type WnCmdRunnerProps = {
  /**
   * 传入的命令
   */
  command?: string;

  /**
   * 命令的输入
   */
  input?: string;

  /**
   * 如果命令执行成功， success 事件传递的内容格式
   */
  sucessAs?: 'json' | 'text';

  /**
   * 如果传入的命令是模板，用这个上下文来渲染
   */
  vars?: Vars;

  /**
   * 命令面板开始时，打印的内容
   */
  preface?: string | string[];
  /**
   * 命令面板结束时，打印的内容
   */
  epilog?: string | string[];
};
