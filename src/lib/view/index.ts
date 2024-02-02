import { TiComSet } from "@site0/tijs";
import { WnArenaInfo } from "./arena/wn-arena-index";
import { WnSkyInfo } from "./sky/wn-sky-index";

export default {
  "WnArena": WnArenaInfo,
  "WnSky": WnSkyInfo
} as TiComSet;

export { WnArena } from "./arena/wn-arena-index";
export { WnSky } from "./sky/wn-sky-index";
