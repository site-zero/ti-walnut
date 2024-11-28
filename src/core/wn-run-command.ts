import { Alert } from '@site0/tijs';
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
        let html = ['<h3>Fail To Parse JSON</h3>'];
        html.push('<pre style="white-space:pre-wrap; width:100%;">');
        html.push('command: ' + cmdText + '\n\n');
        html.push(str);
        html.push('</pre>');
        await Alert(html.join(''), {
          type: 'danger',
          maxWidth: '640px',
          width: '100%',
          contentType: 'html',
        });
        console.error('run-command re-fail to parse json: ', str, errParse);
      }
    }
    return str;
  } catch (reason) {
    // 仅仅是 abort
    if ((reason as any).abort) {
      throw reason;
    }

    let html = ['<h3>Fail To Process</h3>'];
    html.push('<pre>', cmdText, '</pre>');
    html.push('<blockquote>', `${reason}`, '</blockquote>');
    await Alert(html.join(''), {
      type: 'info',
      maxWidth: '640px',
      width: '100%',
      contentType: 'html',
    });
    console.error('run-command fail: ', reason);
    throw reason;
  }
}
