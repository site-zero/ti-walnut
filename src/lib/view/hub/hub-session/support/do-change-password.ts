import { UserInfo, Walnut } from "@site0/ti-walnut";
import {
  Alert,
  evalPasswdStrength,
  FormProps,
  I18n,
  InputPasswordProps,
  LabelProps,
  openAppModal,
  Vars,
} from "@site0/tijs";
import _ from "lodash";

type ChangePasswordOptions = {
  getMe: () => UserInfo | undefined;
  loginSitePath?: string | undefined | null;
  passwdStrength?: number;
};

export async function do_change_password(options: ChangePasswordOptions) {
  const { getMe, loginSitePath, passwdStrength } = options;
  const me = getMe();
  if (!me) {
    await Alert("User Not Found", {
      type: "danger",
    });
    return;
  }

  // 收集用户输入的旧密码和新密码
  let result = await openAppModal({
    icon: "zmdi-lock",
    title: "Change Password",
    type: "primary",
    position: "top",
    width: "480px",
    height: "320px",
    clickMaskToClose: true,
    model: { event: "change", data: "data" },
    // result: {
    //   oldpasswd: "654321",
    //   newpasswd: "123456",
    //   passwd_2: "123456",
    // },

    comType: "TiForm",
    comConf: {
      layoutHint: 1,
      maxFieldNameWidth: 120,
      changeMode: "all",
      fields: [
        {
          title: "Old Password",
          name: "oldpasswd",
          required: true,
          comType: "TiInputPassword",
          comConf: {
            placeholder: "Enter old password",
            showIndicator: false,
          } as InputPasswordProps,
        },
        {
          title: "New Password",
          name: "newpasswd",
          required: true,
          comType: "TiInputPassword",
          comConf: {
            placeholder: "Enter new password",
          } as InputPasswordProps,
        },
        {
          title: " ",
          name: ["newpasswd", "passwd_2"],
          dynamic: true,
          autoValue: null,
          comType: "TiLabel",
          comConf: (vars: Vars): LabelProps => {
            let { newpasswd, passwd_2 } = vars;
            let re: LabelProps = {
              value: "Please Input Confirm Password",
            };
            if (!passwd_2) {
              re.value = "Please Input Confirm Password";
            } else if (newpasswd !== passwd_2) {
              re.value = "Confirm Password does not match New Password";
              re.type = "danger";
              re.colorMode = "no-bg";
              re.prefixIcon = "zmdi-alert-triangle";
            } else {
              re.value = "Confirm Password matches New Password";
              re.type = "success";
              re.colorMode = "no-bg";
              re.prefixIcon = "zmdi-check-circle";
            }
            return re;
          },
        },
        {
          title: " ",
          name: "passwd_2",
          comType: "TiInputPassword",
          comConf: {
            placeholder: "Confirm new password",
            showIndicator: false,
          } as InputPasswordProps,
        },
      ],
    } as FormProps,
    beforeClose: async (api) => {
      let re = api.result.value;
      return passwd_result_is_ok(re, passwdStrength);
    },
  });

  // 用户取消
  if (!result) {
    return;
  }

  // 必须有旧密码
  if (!passwd_result_is_ok(result, passwdStrength)) {
    return;
  }

  // 解构参数
  let { oldpasswd, newpasswd } = result;

  // 判断一下，如果是系统用户直接用 `passwd` 命令修改密码
  if (me.userRace == "SYS") {
    let cmdText = `passwd -old '${oldpasswd}' '${newpasswd}'`;
    let re = await Walnut.exec(cmdText);
    if (re && /^e./.test(re)) {
      let msg = ["i18n:", _.trim(re)].join("");
      await Alert(msg, { type: "danger" });
      return;
    }
  }
  // 否则用 `webx -cqn -ajax "~/www/login" @passwd -oldpass "123456" -newpass "654321"`
  else if (loginSitePath) {
    let cmdText = `webx -cqn -ajax "${loginSitePath}" @passwd -oldpass "${oldpasswd}" -newpass "${newpasswd}"`;
    let re = await Walnut.exec(cmdText, { as: "json" });
    if (!re.ok) {
      let msg = ["i18n:", _.trim(re.errCode)].join("");
      await Alert(msg, { type: "danger" });
      return;
    }
  }
  // 否则警告
  else {
    await Alert("Cannot change password: no valid method found", {
      type: "danger",
    });
    return;
  }

  // 提示成功
  await Alert("Password changed successfully", {
    type: "success",
  });
}

function passwd_result_is_ok(
  result: Vars = {},
  passwdStrength?: number
): boolean {
  // 解构参数
  let { oldpasswd, newpasswd, passwd_2 } = result;

  // 必须有旧密码
  if (!oldpasswd) {
    Alert("Old password is required", {
      type: "danger",
    });
    return false;
  }

  // 必须有新密码
  if (!newpasswd) {
    Alert("New password is required", {
      type: "danger",
    });
    return false;
  }

  // 比对两次密码输入必须一致
  if (newpasswd !== passwd_2) {
    Alert("New password and confirm password do not match", {
      type: "danger",
    });
    return false;
  }

  // 旧密码与新密码相同没必要修改
  if (oldpasswd === newpasswd) {
    Alert("Old password and new password cannot be the same", {
      type: "danger",
    });
    return false;
  }

  // 看看密码的强壮程度
  if (passwdStrength && passwdStrength > 0) {
    let pst = evalPasswdStrength(newpasswd);
    if (pst < passwdStrength) {
      let expect_pst = _.clamp(passwdStrength, 1, 5);
      let expect_txt = I18n.get(`ti-input-password-lvl${expect_pst}`);
      let actual_txt = I18n.get(`ti-input-password-lvl${pst}`);
      let msg = `Password strength is not sufficient: expected ${expect_txt}, but got ${actual_txt}`;
      Alert(msg, { type: "danger" });
      return false;
    }
  }

  // OK 可以修改了
  return true;
}
