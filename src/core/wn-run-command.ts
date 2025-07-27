import { AlertError, Vars } from "@site0/tijs";
import JSON5 from "json5";
import { SessionStore, useSessionStore, WnExecOptions } from "../lib";

export async function wnRunCommand(
  url: string,
  init: RequestInit,
  cmdText: string,
  options: WnExecOptions = {}
): Promise<any> {
  //
  // Beacon 发送模式
  //
  if (options.beacon) {
    let body = {
      mos: options.mos || null,
      cmd: cmdText,
      ffb: false,
      in: options.input,
    } as Vars;
    navigator.sendBeacon(url, JSON5.stringify(body));
    return;
  }

  //
  // 普通发送模式
  //
  const bearAbort = options.bearAbort ?? true;

  // 准备参数
  init.method = "post";
  init.body = new URLSearchParams();
  init.body.append("mos", options.mos ?? "");
  init.body.append("cmd", cmdText);
  init.body.append("ffb", options.forceFlushBuffer ? "true" : "false");
  if (options.input) {
    init.body.append("in", options.input);
  }

  try {
    let resp = await fetch(url, init);
    let str = await resp.text();
    // 处理一下文本
    if (options.mos) {
      const results = str.split("\n" + options.mos);
      str = results[0];
      // 挨个处理服务器宏
      for (let i = 1; i < results.length; i++) {
        await processMOC(results[i]);
      }
    }
    // 处理响应文本的格式
    if ("json" == options.as) {
      try {
        return JSON5.parse(str);
      } catch (errParse) {
        console.error("run-command re-fail to parse json: ", str, errParse);
        await AlertError("Fail To Parse JSON", cmdText, errParse);
      }
    }
    // 那么默认就是返回文本咯
    else {
      return str;
    }
  } catch (reason) {
    // 仅仅是 abort 那么很正常
    let err = reason as any;
    if (err.abort || err.name == "AbortError") {
      if (bearAbort) {
        return;
      }
      throw reason;
    }
    // 要警告一下
    console.error("run-command fail: ", reason);
    await AlertError("Fail To Process", cmdText, reason);
    throw reason;
  }
}

/**
 * 逐个执行服务器处理宏，一个宏的格式可能如下:
 *
 * ```
 * %%%wn.meta.md5tzk4hfn62iv8qlvet8iwejq9l%%:MACRO:update_envs
 * {
 *    "APP_PATH": "/rs/ti/app:/app",
 *    "OPEN": "wn.console",
 *    "PATH": "/bin:/sbin:~/bin",
 *    "UI_PATH": "/etc/ui",
 *    "GRP": "root",
 *    "HOME": "/root",
 *    "MY_GRPS": ["root"],
 *    "LOGIN": 1752109212401,
 *    "ABC": "100",
 *    "SALTED_PASSWD": true,
 *    "THEME": "light",
 *    "PWD": "~",
 *    "APP_HOME": "/rs/ti/app/wn.manager"
 * }
 * ```
 *
 * @param input 输入服务器处理宏
 */
async function processMOC(input: string) {
  // 分析宏，得到宏名称
  let pos = input.indexOf("\n");
  if (pos <= 0) {
    console.warn(`Fail to processMOC pos=${pos}:`, input);
    return;
  }
  let head = input.substring(0, pos).trim();
  let body = input.substring(pos + 1).trim();

  console.log(`processMOC: head=[${head}]`, "\nbody\n", body);
  const fnSet: Record<
    string,
    (session: SessionStore, body: string) => Promise<void>
  > = {
    ":MACRO:update_envs": async (session: SessionStore, body: string) => {
      session.data.env = JSON5.parse(body);
    },
    ":MACRO:change_session": async (session: SessionStore, body: string) => {
      let { seid, exit, old_seid } = JSON5.parse(body);
      // 退出当前会话
      if (!seid) {
        session.resetSession();
      }
      // 切换到这个新会话
      else {
        await session.switchSession(seid, exit, old_seid);
      }
    },
  };
  let fn = fnSet[head];
  if (fn) {
    const session = useSessionStore();
    fn(session, body);
  }
}
