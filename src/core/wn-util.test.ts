import { describe, expect, it, vi } from "vitest";
import { normalizeFullPath } from "./wn-util";

// 使用 TiJS 的真实运行时，避免源码总入口的组件循环依赖。
vi.mock("@site0/tijs", () =>
  vi.importActual<typeof import("@site0/tijs")>(
    "../../node_modules/@site0/tijs/dist/tijs.es.js"
  )
);

describe("normalizeFullPath", () => {
  const vars = {
    HOME: "/home/demo",
    PWD: "/home/demo/work",
    name: "notes",
  };

  it.each([
    ["", ""],
    [" \t\n", " \t\n"],
    ["~/path/to", "/home/demo/path/to"],
    ["~", "/home/demo"],
    ["~/", "/home/demo/"],
    ["path/to", "/home/demo/work/path/to"],
    ["./path/to", "/home/demo/work/./path/to"],
    [".", "/home/demo/work"],
    ["./", "/home/demo/work/"],
    ["path/.", "/home/demo/work/path"],
    ["path/", "/home/demo/work/path/"],
    ["../path", "/home/demo/work/../path"],
    ["/path/to", "/path/to"],
    ["/", "/"],
    ["/.", ""],
    ["/path/.", "/path"],
    ["/path//to/", "/path//to/"],
    ["path//to", "/home/demo/work/path/to"],
    ["~demo/path", "~demo/path"],
    ["id:abc/path", "id:abc/path"],
    ["id:abc/", "id:abc/"],
    ["~/a'b;c", "/home/demo/a'b;c"],
    ["~/${name}", "/home/demo/notes"],
    ["${HOME}/path", "/home/demo/work//home/demo/path"],
    ["/${missing}", "/${missing}"],
  ])("normalizes %j to %j", (input, expected) => {
    expect(normalizeFullPath(input, vars)).toBe(expected);
  });

  it("can disable template expansion without disabling HOME or PWD", () => {
    expect(normalizeFullPath("~/${name}", vars, false)).toBe(
      "/home/demo/${name}"
    );
    expect(normalizeFullPath("${name}", vars, false)).toBe(
      "/home/demo/work/${name}"
    );
  });

  it("preserves root directories when joining paths", () => {
    expect(normalizeFullPath("~", { HOME: "/" })).toBe("/");
    expect(normalizeFullPath("~/", { HOME: "/" })).toBe("/");
    expect(normalizeFullPath("~/path", { HOME: "/" })).toBe("/path");
    expect(normalizeFullPath("path", { PWD: "/" })).toBe("/path");
  });

  it("matches Java defaults for missing environment directories", () => {
    expect(normalizeFullPath("path", {})).toBe("path");
    expect(normalizeFullPath("./path", {})).toBe("path");
    expect(normalizeFullPath(".", {})).toBe("");
    expect(normalizeFullPath("~/path", {})).toBe("/path");
    expect(normalizeFullPath("~/path", { HOME: "" })).toBe("path");
    expect(normalizeFullPath("~/path", { HOME: null })).toBe("/path");
  });

  it("normalizes joined directory separators", () => {
    expect(
      normalizeFullPath("~/path//to/", { HOME: "/home//demo/" })
    ).toBe("/home/demo/path/to/");
    expect(normalizeFullPath("path", { PWD: "/home//demo/" })).toBe(
      "/home/demo/path"
    );
    expect(normalizeFullPath("~/ a / b ", vars)).toBe("/home/demo/a/b");
  });

  it("expands HOME after joining a home-relative PWD", () => {
    expect(normalizeFullPath("path", { HOME: "/home/demo", PWD: "~/work" }))
      .toBe("/home/demo/work/path");
  });

  it.each(["id:", "/path/id:", "${invalid}"])(
    "rejects an empty id path in %j",
    (input) => {
      expect(() =>
        normalizeFullPath(input, { ...vars, invalid: "id:" })
      ).toThrow("Empty path 'id:' is not allowed");
    }
  );
});
