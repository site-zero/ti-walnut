import { afterEach, describe, expect, it, vi } from "vitest";
import { useSessionStore } from "./use-session.store";

vi.mock("@site0/ti-walnut", () => ({}));
vi.mock("../../core", () => ({ Walnut: {} }));
vi.mock("@site0/tijs", () =>
  vi.importActual<typeof import("@site0/tijs")>(
    "../../../node_modules/@site0/tijs/dist/tijs.es.js"
  )
);

describe("session normalizeFullPath", () => {
  const session = useSessionStore();
  const originalEnv = session.data.env;

  afterEach(() => {
    session.data.env = originalEnv;
  });

  it("uses the current session environment", () => {
    session.data.env = {
      HOME: "/home/demo",
      PWD: "/home/demo/work",
      name: "notes",
    };

    expect(session.normalizeFullPath("~/path/to")).toBe("/home/demo/path/to");
    expect(session.normalizeFullPath("path/")).toBe("/home/demo/work/path/");
    expect(session.normalizeFullPath("~/${name}")).toBe("/home/demo/notes");
    expect(session.normalizeFullPath("~/${name}", false)).toBe(
      "/home/demo/${name}"
    );
  });

  it("reads replaced and mutated environments rather than a snapshot", () => {
    const { normalizeFullPath } = session;
    session.data.env = { HOME: "/home/first" };
    expect(normalizeFullPath("~/path")).toBe("/home/first/path");

    session.data.env = { HOME: "/home/second" };
    expect(normalizeFullPath("~/path")).toBe("/home/second/path");

    session.data.env.HOME = "/home/third";
    expect(normalizeFullPath("~/path")).toBe("/home/third/path");
    expect(useSessionStore().normalizeFullPath("~/path")).toBe(
      "/home/third/path"
    );
  });

  it("preserves core behavior for empty environments and invalid paths", () => {
    session.data.env = {};
    expect(session.normalizeFullPath("path")).toBe("path");
    expect(session.normalizeFullPath("")).toBe("");
    expect(() => session.normalizeFullPath("id:")).toThrow(
      "Empty path 'id:' is not allowed"
    );
  });
});
