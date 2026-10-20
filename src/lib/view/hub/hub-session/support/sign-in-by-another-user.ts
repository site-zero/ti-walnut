import { Walnut } from "@site0/ti-walnut";
import { AjaxResult, Alert, AlertError, Alg, Prompt } from "@site0/tijs";
import _ from "lodash";

type SignInByAnotherUserOptions = {
  loginSitePath?: string | null | undefined;
  isAdmin: () => boolean;
};

export async function sign_in_by_another_user(
  options: SignInByAnotherUserOptions
) {
  const { loginSitePath, isAdmin } = options;
  if (!loginSitePath) {
    Alert("loginSitePath without defined", { type: "danger" });
    return;
  }
  if (isAdmin()) {
    let _name = await Prompt("Input the User you want to Login", {
      type: "primary",
    });
    let newName = _.trim(_name).replaceAll(/['"]/g, "");
    // 用户取消
    if (!newName) {
      return;
    }

    // 准备命令
    let cmdText = `login -site "${loginSitePath}" "${newName}"`;
    // 准备宏分隔符，因为要用服务器宏自动登录切换 session
    let mos = ["%%", Alg.genSnowQ(20, "%wn.meta."), "%%"].join("");

    // 执行登录
    let re: AjaxResult = await Walnut.exec(cmdText, {
      as: "json",
      mos,
      forceFlushBuffer: true,
    });

    // 如果成功，不管怎么样，刷新一下页面
    if (re.ok) {
      _.delay(() => {
        window.location.reload();
      }, 300);
    } else {
      await AlertError("Fail to login", cmdText, re);
    }
  }
}
