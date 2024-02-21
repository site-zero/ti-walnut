import JSON5 from 'json5';
import { WnExecOptions } from '../lib';

export async function wnRunCommand(
  url: string,
  init: RequestInit,
  cmdText: string,
  options: WnExecOptions = {}
): Promise<any> {
  init.method = 'post';
  init.body = new URLSearchParams();
  init.body.append('mos', '');
  init.body.append('cmd', cmdText);
  init.body.append('ffb', 'true');
  if (options.input) {
    init.body.append('in', options.input);
  }

  try {
    let resp = await fetch(url, init);
    let str = await resp.text();
    if ('json' == options.as) {
      try {
        return JSON5.parse(str);
      } catch (errParse) {
        console.error('run-command re-fail to parse json: ', str, errParse);
      }
    }
    return str;
  } catch (reason) {
    console.error('run-command fetch error: ', reason);
    throw reason;
  }
}
