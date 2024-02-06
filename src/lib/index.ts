import _ from "lodash";
import { tiPutComponents } from "@site0/tijs";
import _com_set_view from "./view/";
import _com_set_shelf from "./shelf/";

tiPutComponents(_com_set_view);
tiPutComponents(_com_set_shelf);

export * from "./_top";
export * from "./_store";
export * from "./view";
export * from "./shelf";
