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
