import { ref } from "vue";
import { Walnut } from "../../core";

/**
 * 本接口，讲批量获取指定格式的实体 ID, 每当调用者调用接口获取 ID
 * 它就会返回缓存中的数据，如果缓存用尽，则会再次批量获取
 */
export type EntityIdApi = ReturnType<typeof useEntityIdStore>;
export type EntityIdOptions = {
  /**
   * ID 的模式，默认 `snowQ::10`
   * 参见 `man val gen` 的描述
   */
  mode?: string;

  /**
   * 每次生成 ID 的数量，默认值为 100
   */
  batch?: number;
};

export function useEntityIdStore(options: EntityIdOptions = {}) {
  const idCache = ref<string[]>([]);
  const _index = ref<number>(0);

  async function _re_fill_cache() {
    let n = options.batch || 100;
    let mode = options.mode || "snowQ::10";
    let cmdText = `val gen ${mode} -n ${n} -json`;
    let re = await Walnut.exec(cmdText, { as: "json" });
    idCache.value = re;
    _index.value = 0;
  }

  async function nextId() {
    if (_index.value >= idCache.value.length) {
      await _re_fill_cache();
    }
    return idCache.value[_index.value++];
  }

  return {
    nextId,
  };
}
