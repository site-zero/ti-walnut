import { Walnut } from "./wn-server";

export type WnGenIdOptions = {
  /**
   * 生成 ID 的模式，默认为 "snowQ::10"
   */
  mode?: string;

  /**
   * 批量生成 ID 的数量，默认为 100
   */
  batchSize?: number;
};

export type WnGenIdsApi = ReturnType<typeof useWnGenIds>;

export function useWnGenIds(options: WnGenIdOptions = {}) {
  const { mode = "snowQ::10", batchSize = 100 } = options;
  // 缓存 ids
  let _ids: string[] = [];
  let _index = 0;

  function reset() {
    _ids = [];
    _index = 0;
  }

  async function prepare() {
    _ids = await Walnut.genIds(batchSize, mode);
    _index = 0;
  }

  async function nextId() {
    // 生成一批新的
    if (_index >= _ids.length) {
      await prepare();
    }
    return _ids[_index++];
  }

  return {
    reset,
    prepare,
    nextId,
  };
}
