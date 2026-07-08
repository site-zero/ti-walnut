import { ActionBarProps } from "@site0/tijs";
import _ from "lodash";
import { WnObjTitleApi } from "./use-wn-obj-title-api";
import { WnObjTitleProps } from "./wn-obj-title-types";

export function useWnObjTitleActions(
  props: WnObjTitleProps,
  api: WnObjTitleApi
): ActionBarProps {
  let re: ActionBarProps = {
    barPad: "none",
    barItemSet: {
      EDIT: {
        icon: "fas-pen-to-square",
        tip: "Edit Title",
        action: () => {
          api.onEdit();
        },
      },
    },
    items: ["EDIT"],
  };

  return _.assign(re, props.actionBar);
}
