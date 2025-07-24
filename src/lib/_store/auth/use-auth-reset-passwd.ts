import {
  AjaxResult,
  Alert,
  IconInput,
  ProcessProps,
  Prompt,
} from "@site0/tijs";
import _ from "lodash";
import { reactive, ref } from "vue";
import { Walnut } from "../../../..";
import { _auth_inner_api, AuthStoreOptions } from "./use-auth.store";

export function useAuthResetPasswd(
  api: _auth_inner_api,
  options: AuthStoreOptions
) {
  let { sitePath } = options;
  let { _users, _gb_state } = api;
  /**
   * 指定更新的状态
   * - wait: 还未开始执行
   * - ing:  正在执行
   * - ok:   执行成功
   * - `string`: 执行错误的错误码
   */
  const status = new Map<string, "wait" | "ing" | "ok" | string>();
  //------------------------------------------------------
  async function execPasswdCmd(
    userName: string,
    newpass: string
  ): Promise<AjaxResult> {
    // 检查危险字符
    if (!userName || userName.indexOf('"') >= 0) {
      return {
        ok: false,
        errCode: "e.auth.usr.InvalidName",
        data: userName,
      };
    }
    // 准备命令
    let cmdText = [
      `webx -cqn -ajax "${sitePath}"`,
      `@passwd -name "${userName}" -newpass "${newpass}"`,
    ].join(" ");

    return await Walnut.exec(cmdText, { as: "json" });
  }
  //------------------------------------------------------
  async function doResetPassword() {
    // 检查用户
    let usrs = _users.getCheckedItems();
    if (_.isEmpty(usrs)) {
      return await Alert("Please select user first", { type: "warn" });
    }
    // 指定新密码
    let newpwd = await Prompt("Please input new password", {
      type: "info",
      position: "top",
    });
    newpwd = _.trim(newpwd);

    // 防空
    if (!newpwd) {
      return;
    }

    // 检查一下密码是否符合规范
    if (/["']/.test(newpwd)) {
      return await Alert(`Password cannot contain quotes`, {
        type: "danger",
      });
    }

    if (newpwd.length < 6) {
      return await Alert(`Password length cannot be less than 6`, {
        type: "danger",
      });
    }

    // 准备退出新号
    const abort_processing = ref(false);

    // 准备初始化进度
    let N = usrs.length;
    _gb_state.data.process = reactive({
      title: {
        text: `Reset Passwod for selected (${N}) User`,
      },
      progress: {
        value: 0,
      },
      listData: [],
      listCurrentRowIndex: 0,
      listConf: {
        styleSheet: `
        .list-item .list-part.as-text abbr {
          color: var(--ti-color-danger);
          opacity: 1;
        }`,
      },
      abort: {
        icon: "far-circle-stop",
        text: "Abort",
        action: () => {
          abort_processing.value = true;
        },
      },
    } as ProcessProps);

    // 准备一个更新函数
    function _update_process() {
      _gb_state.data.process!.listData = usrs.map((usr) => {
        let st = status.get(usr.id) ?? "wait";
        // 判断是否为错误状态
        if (st && !/^(wait|ing|ok)$/.test(st)) {
          st = "error";
        }

        let icon = {
          wait: {
            type: "font",
            value: "fas-hourglass-start",
            logicType: "track",
          } as IconInput,
          ing: {
            type: "font",
            value: "fas-hourglass-half",
            logicType: "secondary",
          } as IconInput,
          ok: {
            type: "font",
            value: "fas-check",
            logicType: "success",
          } as IconInput,
          error: {
            type: "font",
            value: "zmdi-alert-triangle",
            logicType: "danger",
          } as IconInput,
        }[st];

        let tip: string | undefined = undefined;
        if (st == "error") {
          tip = status.get(usr.id) as string;
          tip =
            {
              "e.jsbin.job_in_progress": "Job In Progress",
            }[tip] || tip;
        }
        return {
          icon,
          tip,
          text: [usr.nm, usr.nickname].join(": "),
          value: usr.id,
        };
      });
    }

    // 初始化状态
    _update_process();

    // 循环执行
    for (let i = 0; i < N; i++) {
      let usr = usrs[i];
      // 滚动显示
      _gb_state.data.process!.listCurrentRowIndex = i;

      // 用户主动取消
      if (abort_processing.value) {
        break;
      }

      // 更新进度
      _gb_state.data.process!.progress!.value = (i + 1) / N;

      // 更新状态
      status.set(usr.id, "ing");

      let result: AjaxResult;
      try {
        result = await execPasswdCmd(usr.nm, newpwd);
      } catch (err) {
        result = {
          ok: false,
          errCode: "e.auth.restpass.Fail",
          data: err,
        };
      }

      // 更新执行后状态
      if (result.ok) {
        status.set(usr.id, "ok");
      } else {
        status.set(usr.id, result.errCode || JSON.stringify(result));
      }

      // 渲染进度更新
      _update_process();
    }

    // 标记完成
    _gb_state.data.process!.abort = {
      icon: "far-circle-check",
      text: "All Done, Click To Close",
      type: "success",
      action: () => {
        abort_processing.value = true;
        _gb_state.data.process = undefined;
      },
    };
  }
  //------------------------------------------------------
  // 返回的特性应该就是一个函数就好
  //------------------------------------------------------
  return doResetPassword;
}
