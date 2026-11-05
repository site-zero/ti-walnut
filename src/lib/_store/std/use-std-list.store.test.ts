import type { WnObj } from "@site0/ti-walnut";
import { normalizeFullPath, useRdsListStore } from "@site0/ti-walnut";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, type EffectScope, type Ref } from "vue";
import {
  useStdListStore,
  type StdListStoreOptions,
} from "./use-std-list.store";

const objApi = vi.hoisted(() => ({
  fetch: vi.fn<(path: string) => Promise<WnObj | undefined>>(),
  get: vi.fn<(id: string) => Promise<WnObj | undefined>>(),
  getAncestors:
    vi.fn<
      (
        options: { includeSelft?: boolean; until?: string },
        path: string
      ) => Promise<WnObj[]>
    >(),
  query: vi.fn(),
}));

const { sqlApi, keep, filterRecordNilValue } = vi.hoisted(() => ({
  sqlApi: { query: vi.fn(), count: vi.fn() },
  keep: { loadObj: vi.fn(), save: vi.fn(), remove: vi.fn() },
  filterRecordNilValue: vi.fn(),
}));

vi.mock("@site0/ti-walnut", async () => {
  const { ref } = await import("vue");
  return {
    useWnObj: () => objApi,
    useSqlx: () => sqlApi,
    isWnObj: (value: unknown) =>
      typeof value === "object" && value !== null && "id" in value,
    useLocalListEdit: (remote: Ref<WnObj[] | undefined>) => ({
      localList: ref<WnObj[]>(),
      reset: vi.fn(),
      isChanged: () => false,
      getRowIndex: (id: string) =>
        (remote.value ?? []).findIndex((item) => item.id === id),
      insertItemsBefore: vi.fn(),
      insertItemsAfter: vi.fn(),
    }),
    updatePager: vi.fn(),
    updatePagerTotal: (pager: { totalCount?: number }, total: number) => {
      pager.totalCount = total;
    },
  };
});

vi.mock("@site0/tijs", async () => {
  const { default: lodash } = await import("lodash");
  const { appendPath, Tmpl } = await vi.importActual<
    typeof import("@site0/tijs")
  >("../../../../node_modules/@site0/tijs/dist/tijs.es.js");
  return {
    appendPath,
    Tmpl,
    Util: {
      jsonClone: lodash.cloneDeep,
      explainObj: (_context: unknown, value: unknown) => value,
      filterRecordNilValue,
      filterRecordNilValueDeeply: (value: unknown) => value,
    },
    useKeep: () => keep,
  };
});

vi.mock("../use-session.store", () => ({
  useSessionStore: () => ({
    normalizeFullPath: (path: string) =>
      normalizeFullPath(path, {
        HOME: "/home/demo",
        PWD: "/home/demo/work",
      }),
  }),
}));

vi.mock("../use-obj-content.store", async () => {
  const { ref } = await import("vue");
  return {
    useObjContentStore: () => ({ changed: ref(false) }),
  };
});

vi.mock("./support/auto-create-home", () => ({
  auto_create_obj: vi.fn(),
}));

const scopes: EffectScope[] = [];

function createStore(options: Partial<StdListStoreOptions> = {}) {
  const scope = effectScope();
  scopes.push(scope);
  return scope.run(() => useStdListStore({ homePath: "home", ...options }))!;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetAllMocks();
  objApi.fetch.mockImplementation(async (path) => ({ id: path, race: "DIR" }));
  objApi.query.mockResolvedValue([[], {}]);
  objApi.getAncestors.mockResolvedValue([{ id: "root" }]);
  sqlApi.query.mockResolvedValue([]);
  sqlApi.count.mockResolvedValue(0);
  filterRecordNilValue.mockImplementation((value: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(value).filter(
        ([, item]) => item !== null && item !== undefined
      )
    )
  );
});

afterEach(() => {
  scopes.splice(0).forEach((scope) => scope.stop());
  vi.restoreAllMocks();
});

describe("standard list behavior alignment", () => {
  it("clears persisted queries and rebuilds the current default query", () => {
    const query = { filter: { race: "FILE" }, sorter: { nm: 1 } };
    const store = createStore({ query });
    store.setFilter({ nm: "changed" });
    store.setSorter({ ct: -1 });
    store.resetLocalQuery();
    expect(keep.remove).toHaveBeenCalledTimes(1);
    expect(store.Filter.value).toEqual({ race: "FILE" });
    expect(store.Sorter.value).toEqual({ nm: 1 });
    expect(store.Pager.value).toEqual({ pageNumber: 1, pageSize: 50 });
  });

  it("passes original query objects and indices to patchRemote", async () => {
    const items = [
      { id: "one", nm: "original" },
      { id: "two", nm: "second" },
    ];
    const patchRemote = vi.fn((item: WnObj) => {
      item.nm += "-patched";
      return item;
    });
    objApi.query.mockResolvedValueOnce([items, {}]);
    const store = createStore({ autoLoadAncestors: false, patchRemote });
    await store.reload();
    expect(patchRemote).toHaveBeenNthCalledWith(1, items[0], 0);
    expect(patchRemote).toHaveBeenNthCalledWith(2, items[1], 1);
    expect(patchRemote.mock.calls[0][0]).toBe(items[0]);
    expect(items[0].nm).toBe("original-patched");
    expect(store.remoteList.value).toEqual(items);
  });

  it.each([-1, 0, 1, 2, 3])(
    "delegates insertion index %s without rewriting it",
    (index) => {
      const store = createStore();
      store.setRemoteList([{ id: "one" }, { id: "two" }]);
      const items = [{ id: "new" }];
      store.insertItemsBefore(items, index);
      store.insertItemsAfter(items, index);
      expect(store._local.insertItemsBefore).toHaveBeenCalledTimes(1);
      expect(store._local.insertItemsAfter).toHaveBeenCalledTimes(1);
      expect(store._local.insertItemsBefore).toHaveBeenCalledWith(items, index);
      expect(store._local.insertItemsAfter).toHaveBeenCalledWith(items, index);
    }
  );

  it("removes nil filter values while retaining false, zero and empty strings", () => {
    const store = createStore();
    const filter = {
      missing: undefined,
      nil: null,
      enabled: false,
      count: 0,
      nm: "",
    };
    store.setFilter(filter);
    expect(filterRecordNilValue).toHaveBeenCalledWith(filter);
    expect(store.Filter.value).toEqual({ enabled: false, count: 0, nm: "" });
    expect(keep.save).toHaveBeenLastCalledWith({
      filter: { enabled: false, count: 0, nm: "" },
      sorter: {},
      pager: { pageSize: 50 },
    });
  });
});

for (const kind of ["std", "rds"] as const) {
  describe(`${kind} list query and action status`, () => {
    function createList() {
      if (kind === "std") {
        return createStore({ autoLoadAncestors: false });
      }
      const scope = effectScope();
      scopes.push(scope);
      return scope.run(() =>
        useRdsListStore({
          query: {
            filter: {},
            sorter: {},
            pager: { pageNumber: 1, pageSize: 50 },
          },
          sqlQuery: "list",
          sqlCount: "count",
        })
      )!;
    }

    it.each(["queryRemoteList", "reload", "refresh"] as const)(
      "logs query failures in %s, rethrows the same error and clears loading status",
      async (method) => {
        const store = createList();
        await store.reload();
        const old = [{ id: "previous" }];
        store.setRemoteList(old);
        const error = new Error("query failed");
        const log = vi.spyOn(console, "error").mockImplementation(() => {});
        (kind === "std" ? objApi : sqlApi).query.mockRejectedValueOnce(error);
        await expect(store[method]()).rejects.toBe(error);
        expect(log).toHaveBeenCalledWith(
          "Error happened when queryRemoteList:",
          error
        );
        expect(store.ActionStatus.value).toBeUndefined();
        expect(store.remoteList.value).toEqual(old);
      }
    );

    it("exposes the same action-bar fields and the selected current item", async () => {
      const store = createList();
      store.setRemoteList([{ id: "one", nm: "selected" }]);
      await store.selectItem("one");
      expect(store.ActionBarVars.value).toEqual({
        loading: false,
        saving: false,
        deleting: false,
        changed: false,
        empty: false,
        hasCurrent: true,
        hasChecked: true,
        currentItem: store.CurrentItem.value,
      });
      if ("setActionStatus" in store) {
        store.setActionStatus("deleting");
        expect(store.ActionBarVars.value.deleting).toBe(true);
      }
    });
  });
}

describe("RDS count status cleanup", () => {
  it.each(["success", "failure"] as const)(
    "clears loading on count %s",
    async (outcome) => {
      const store = useRdsListStore({
        query: {
          filter: {},
          sorter: {},
          pager: { pageNumber: 1, pageSize: 50, totalCount: 7 },
        },
        sqlQuery: "list",
        sqlCount: "count",
      });
      const request = deferred<number>();
      sqlApi.count.mockReturnValueOnce(request.promise);
      const loading = store.countRemoteList();
      expect(store.ActionStatus.value).toBe("loading");
      const error = new Error("count failed");
      if (outcome === "success") {
        request.resolve(42);
        await loading;
        expect(store.Pager.value?.totalCount).toBe(42);
      } else {
        request.reject(error);
        await expect(loading).rejects.toBe(error);
        expect(store.Pager.value?.totalCount).toBe(7);
      }
      expect(store.ActionStatus.value).toBeUndefined();
    }
  );
});

describe("standard list ancestors", () => {
  it("starts empty and does not request ancestors without a home", async () => {
    const store = createStore();
    expect(store.Ancestors.value).toEqual([]);
    expect(store.AncestorsPath.value).toBe("");
    await store.reloadAncestors();
    await store.reloadAncestors(true);
    expect(objApi.getAncestors).not.toHaveBeenCalled();
  });

  it("automatically loads ancestors including the home itself by default", async () => {
    const store = createStore();
    await store.reload();
    await nextTick();
    await store.reloadAncestors();
    expect(objApi.getAncestors).toHaveBeenCalledTimes(1);
    expect(objApi.getAncestors).toHaveBeenCalledWith(
      { includeSelft: true, until: "~" },
      "id:home"
    );
    expect(store.Ancestors.value).toEqual([{ id: "root" }]);

    store.assignOptions({ homePath: "other" });
    objApi.getAncestors.mockResolvedValueOnce([{ id: "other-parent" }]);
    await store.reload();
    await store.reloadAncestors();
    expect(objApi.getAncestors).toHaveBeenLastCalledWith(
      { includeSelft: true, until: "~" },
      "id:other"
    );
    expect(store.Ancestors.value).toEqual([{ id: "other-parent" }]);
  });

  it.each([
    ["~/work", "/home/demo/work"],
    ["~/work/", "/home/demo/work"],
    ["~/work", "/home/demo/work/"],
    ["~/work///", "/home/demo/work///"],
    [".", "/home/demo/work/"],
    ["~", "/home/demo/"],
    ["/", "/"],
  ])("uses the home itself when %j matches %j", async (until, ph) => {
    const home: WnObj = { id: "home", ph, nm: "work", race: "DIR" };
    objApi.fetch.mockResolvedValue(home);
    const store = createStore({ ancestorUntil: until });
    await store.reload();
    await store.reloadAncestors();
    await store.reloadAncestors(true);
    expect(objApi.getAncestors).not.toHaveBeenCalled();
    expect(store.Ancestors.value).toEqual([home]);
    expect(store.Ancestors.value[0]).toBe(store.HomeObj.value);
    expect(store.AncestorsPath.value).toBe("work");
  });

  it.each([
    [undefined, "/home/demo/work"],
    ["~/work", "/home/demo/other/"],
    ["~/work", undefined],
  ])("queries when the explicit boundary does not match", async (until, ph) => {
    objApi.fetch.mockResolvedValue({ id: "home", ph, race: "DIR" });
    const store = createStore({
      autoLoadAncestors: false,
      ancestorUntil: until,
    });
    await store.reload();
    await store.reloadAncestors();
    expect(objApi.getAncestors).toHaveBeenCalledWith(
      { includeSelft: true, until: until || "~" },
      "id:home"
    );
  });

  it("does not allow a pending query to overwrite the matching home", async () => {
    objApi.fetch.mockResolvedValue({
      id: "home",
      ph: "/home/demo/work",
      race: "DIR",
    });
    const store = createStore({ autoLoadAncestors: false });
    await store.reload();
    const pending = deferred<WnObj[]>();
    objApi.getAncestors.mockReturnValueOnce(pending.promise);
    const loading = store.reloadAncestors();
    store.assignOptions({ ancestorUntil: "~/work/" });
    await store.reloadAncestors();
    pending.resolve([{ id: "outdated" }]);
    await loading;
    expect(objApi.getAncestors).toHaveBeenCalledTimes(1);
    expect(store.Ancestors.value).toEqual([store.HomeObj.value]);
  });

  it("computes the ancestor path in list order and updates after reloading", async () => {
    const store = createStore({ autoLoadAncestors: false });
    await store.reload();
    objApi.getAncestors.mockResolvedValueOnce([
      { id: "root", nm: "root" },
      { id: "parent", nm: "documents" },
    ]);
    await store.reloadAncestors();
    expect(store.AncestorsPath.value).toBe("root/documents");

    objApi.getAncestors.mockResolvedValueOnce([{ id: "root", nm: "root" }]);
    await store.reloadAncestors(true);
    expect(store.AncestorsPath.value).toBe("root");

    objApi.getAncestors.mockResolvedValueOnce([]);
    await store.reloadAncestors(true);
    expect(store.AncestorsPath.value).toBe("");
  });

  it("supports manual loading when automatic loading is disabled", async () => {
    const store = createStore({ autoLoadAncestors: false });
    await store.reload();
    await nextTick();
    expect(objApi.getAncestors).not.toHaveBeenCalled();
    expect(store.Ancestors.value).toEqual([]);
    await store.reloadAncestors();
    expect(store.Ancestors.value).toEqual([{ id: "root" }]);
  });

  it("deduplicates by home ID even when the home object is replaced", async () => {
    const store = createStore();
    await store.init();
    await store.reloadAncestors();
    await store.reload();
    await store.reloadAncestors();
    expect(objApi.getAncestors).toHaveBeenCalledTimes(1);

    objApi.getAncestors.mockResolvedValueOnce([{ id: "updated-parent" }]);
    await store.reloadAncestors(true);
    expect(objApi.getAncestors).toHaveBeenCalledTimes(2);
    expect(store.Ancestors.value).toEqual([{ id: "updated-parent" }]);
  });

  it("deduplicates empty ancestor lists", async () => {
    objApi.getAncestors.mockResolvedValue([]);
    const store = createStore();
    await store.reload();
    await store.reloadAncestors();
    await store.reloadAncestors();
    expect(store.Ancestors.value).toEqual([]);
    expect(objApi.getAncestors).toHaveBeenCalledTimes(1);
  });

  it("reuses pending requests while allowing force to start a new one", async () => {
    const store = createStore({ autoLoadAncestors: false });
    await store.reload();
    const old = deferred<WnObj[]>();
    objApi.getAncestors.mockReturnValueOnce(old.promise);
    const first = store.reloadAncestors();
    const second = store.reloadAncestors();
    expect(objApi.getAncestors).toHaveBeenCalledTimes(1);

    objApi.getAncestors.mockResolvedValueOnce([{ id: "new-parent" }]);
    await store.reloadAncestors(true);
    expect(objApi.getAncestors).toHaveBeenCalledTimes(2);
    old.resolve([{ id: "old-parent" }]);
    await Promise.all([first, second]);
    expect(store.Ancestors.value).toEqual([{ id: "new-parent" }]);
  });

  it("does not apply an old home's response after switching homes", async () => {
    const store = createStore({ autoLoadAncestors: false });
    await store.reload();
    const old = deferred<WnObj[]>();
    objApi.getAncestors.mockReturnValueOnce(old.promise);
    const first = store.reloadAncestors();

    store.assignOptions({ homePath: "other" });
    await store.reload();
    objApi.getAncestors.mockResolvedValueOnce([{ id: "other-parent" }]);
    await store.reloadAncestors();
    old.resolve([{ id: "old-parent" }]);
    await first;
    expect(store.Ancestors.value).toEqual([{ id: "other-parent" }]);
  });

  it("propagates failures and allows retrying the same home", async () => {
    const store = createStore({ autoLoadAncestors: false });
    await store.reload();
    objApi.getAncestors.mockRejectedValueOnce(new Error("ancestors failed"));
    await expect(store.reloadAncestors()).rejects.toThrow("ancestors failed");
    await store.reloadAncestors();
    expect(objApi.getAncestors).toHaveBeenCalledTimes(2);
    expect(store.Ancestors.value).toEqual([{ id: "root" }]);
  });

  it("uses automatic-loading options supplied during init", async () => {
    const store = createStore();
    await store.init({ homePath: "other", autoLoadAncestors: false });
    await nextTick();
    expect(objApi.getAncestors).not.toHaveBeenCalled();
    await store.reloadAncestors();
    expect(objApi.getAncestors).toHaveBeenLastCalledWith(
      { includeSelft: true, until: "~" },
      "id:other"
    );
  });
});
