import { describe, expect, it, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createSubstrate } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_APPS = resolve(__dirname, "..", "templates", "instance", "apps");

const ENABLED = process.env.SUBSTRATE_INTEGRATION === "1";

let substrate;

afterEach(async () => {
  if (substrate) {
    await substrate.close();
    substrate = null;
  }
});

describe.skipIf(!ENABLED)("createSubstrate with infrastructure", () => {
  it("boots all services and serves example endpoints", async () => {
    substrate = await createSubstrate({
      appsDir: TEMPLATE_APPS,
      redis: { url: process.env.REDIS_URL ?? "redis://localhost:6379" },
      postgres: { url: process.env.DATABASE_URL ?? "postgres://substrate:substrate@localhost:5432/substrate" },
    });

    expect(substrate.services.pg).toBeTruthy();
    expect(substrate.services.redis).toBeTruthy();
    expect(substrate.services.realtime).toBeTruthy();
    expect(substrate.services.workflow).toBeTruthy();
    expect(substrate.services.cells).toBeTruthy();

    const registered = substrate.services.workflow.listWorkflows();
    expect(registered.some((w) => w.name === "greet")).toBe(true);

    const server = await substrate.listen(0);
    const port = server.address().port;

    const root = await fetch(`http://127.0.0.1:${port}/example/`).then((r) => r.json());
    expect(root.services.workflow).toBe(true);

    const greet = await fetch(`http://127.0.0.1:${port}/example/greet/world`, { method: "POST" }).then((r) => r.json());
    expect(greet.executionId).toBeTruthy();

    const counter = await fetch(`http://127.0.0.1:${port}/example/counter`).then((r) => r.json());
    expect(counter.counter).toBe(0);
  });
});
