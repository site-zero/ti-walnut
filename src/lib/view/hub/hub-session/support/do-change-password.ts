import {
  Alert,
  FormProps,
  InputPasswordProps,
  LabelProps,
  openAppModal,
  Vars,
} from "@site0/tijs";

export async function do_change_password() {
  // 收集用户输入的旧密码和新密码
  let re = await openAppModal({
    icon: "zmdi-lock",
    title: "Change Password",
    type: "primary",
    position: "top",
    width: "480px",
    height: "320px",
    clickMaskToClose: true,
    model: { event: "change", data: "data" },
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
  });

  // 用户取消
  if (!re) {
    return;
  }

  // 比对两次密码输入
  let { oldpasswd, newpasswd, passwd_2 } = re.data;
  if (newpasswd !== passwd_2) {
    await Alert("New password and confirm password do not match", {
      type: "danger",
    });
    return;
  }

  // 旧密码与新密码相同
  if (oldpasswd === newpasswd) {
    await Alert("Old password and new password cannot be the same", {
      type: "danger",
    });
    return;
  }

  alert("还未完成实现");

  // 判断一下，如果是系统用户直接用 `passwd` 命令修改密码

  // 否则用 `webx -cqn -ajax "~/www/login" @passwd -oldpass "123456" -newpass "654321"`
}
