import { describe, expect, it, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createSubstrate } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_APPS = resolve(__dirname, "..", "templates", "instance", "apps");

let substrate;

afterEach(async () => {
  if (substrate) {
    await substrate.close();
    substrate = null;
  }
});

describe("createSubstrate without infrastructure", () => {
  it("boots, mounts apps, and exposes empty services", async () => {
    substrate = await createSubstrate({ appsDir: TEMPLATE_APPS });

    expect(substrate.manifests.length).toBe(2);
    expect(substrate.services.pg).toBeNull();
    expect(substrate.services.redis).toBeNull();
    expect(substrate.services.realtime).toBeNull();
    expect(substrate.services.workflow).toBeNull();
    expect(substrate.services.cells).toBeNull();

    const server = await substrate.listen(0);
    const port = server.address().port;

    const resp = await fetch(`http://127.0.0.1:${port}/_admin/`);
    const body = await resp.json();
    expect(body.apps.map((a) => a.name).sort()).toEqual(["admin", "example"]);
    expect(body.services).toEqual({
      pg: false,
      redis: false,
      realtime: false,
      workflow: false,
      cells: false,
      auth: false,
    });
  });

  it("requires appsDir", async () => {
    await expect(createSubstrate({})).rejects.toThrow(/appsDir is required/);
  });
});
