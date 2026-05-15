import { describe, expect, it } from "vitest";
import { defineApp, loadManifests } from "../src/manifest.js";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_APPS = resolve(__dirname, "..", "templates", "instance", "apps");

describe("defineApp", () => {
  it("returns the manifest unchanged when valid", () => {
    const m = defineApp({ name: "foo", routes: "./routes.js" });
    expect(m.name).toBe("foo");
  });

  it("requires a name", () => {
    expect(() => defineApp({})).toThrow(/name is required/);
  });

  it("rejects non-objects", () => {
    expect(() => defineApp(null)).toThrow();
    expect(() => defineApp("foo")).toThrow();
  });

  it("rejects unknown fields", () => {
    expect(() => defineApp({ name: "foo", weirdo: 1 })).toThrow(/unknown field "weirdo"/);
  });

  it("requires routes/workflows/cells/migrations to be strings", () => {
    expect(() => defineApp({ name: "foo", routes: 42 })).toThrow(/routes must be a relative path string/);
    expect(() => defineApp({ name: "foo", workflows: {} })).toThrow(/workflows must be a relative path string/);
    expect(() => defineApp({ name: "foo", cells: [] })).toThrow(/cells must be a relative path string/);
  });

  it("requires records/channels to be string arrays", () => {
    expect(() => defineApp({ name: "foo", records: "nope" })).toThrow(/records must be an array/);
    expect(() => defineApp({ name: "foo", channels: [1, 2] })).toThrow(/channels entries must be strings/);
  });

  it("validates auth.scopes is a string array", () => {
    expect(() => defineApp({ name: "foo", auth: { scopes: "admin" } })).toThrow(/auth.scopes must be an array/);
    expect(() => defineApp({ name: "foo", auth: { scopes: [1] } })).toThrow(/auth.scopes entries must be strings/);
  });

  it("rejects auth that is not an object", () => {
    expect(() => defineApp({ name: "foo", auth: "nope" })).toThrow(/auth must be an object/);
    expect(() => defineApp({ name: "foo", auth: ["admin"] })).toThrow(/auth must be an object/);
  });

  it("accepts the full schema", () => {
    const m = defineApp({
      name: "foo",
      basePath: "/foo",
      routes: "./routes.js",
      workflows: "./workflows.js",
      cells: "./cells.js",
      records: ["foo/*"],
      channels: ["foo/*"],
      migrations: "./migrations",
      auth: { scopes: ["foo:read"] },
    });
    expect(m.name).toBe("foo");
  });
});

describe("loadManifests", () => {
  it("loads every app from a directory", async () => {
    const manifests = await loadManifests(TEMPLATE_APPS);
    const names = manifests.map((m) => m.name).sort();
    expect(names).toEqual(["admin", "example"]);
    for (const m of manifests) {
      expect(m.dir).toBeTruthy();
      expect(m.routes).toBeTruthy();
    }
  });
});
