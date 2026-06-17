import {
  useSessionStore,
  WnUploadFileNameRender,
  WnUploadNameContext,
} from "@site0/ti-walnut";
import { DateTime, Tmpl } from "@site0/tijs";
import _ from "lodash";

export type WnUploadNameOptions = {
  name?: string | WnUploadFileNameRender;
};

export function useUploadName(options: WnUploadNameOptions) {
  const session = useSessionStore();

  function genContext(): WnUploadNameContext {
    let nowInSec = DateTime.format(new Date(), { fmt: "yyyyMMddHHmmss" });
    let nowInMin = nowInSec.substring(0, 12);
    let today = nowInSec.substring(0, 8);
    let timeInSec = nowInSec.substring(8);
    let timeInMin = timeInSec.substring(0, 4);
    let loginName = session.data.loginName || "[anonymity]";
    let nickname = session.data.me?.nickname || loginName;
    return {
      nowInSec,
      nowInMin,
      today,
      timeInSec,
      timeInMin,
      loginName,
      nickname,
    };
  }

  return function () {
    let ctx = genContext();
    let name = options.name || "Upload-File-${now}";
    if (_.isString(name)) {
      let tmpl = Tmpl.parse(name);
      return tmpl.render(ctx);
    }
    return name(ctx);
  };
}
