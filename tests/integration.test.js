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
      auth: {
        session: { secret: "integration-test-secret" },
        tablePrefix: "auth_",
        roles: ["user", "admin"],
      },
    });

    expect(substrate.services.pg).toBeTruthy();
    expect(substrate.services.redis).toBeTruthy();
    expect(substrate.services.realtime).toBeTruthy();
    expect(substrate.services.workflow).toBeTruthy();
    expect(substrate.services.cells).toBeTruthy();
    expect(substrate.services.auth).toBeTruthy();
    expect(substrate.services.auth.roles).toEqual({ user: 1, admin: 2 });

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

    const meAnon = await fetch(`http://127.0.0.1:${port}/example/me`);
    expect(meAnon.status).toBe(401);

    const email = `it+${Date.now()}@example.com`;
    const reg = await fetch(`http://127.0.0.1:${port}/example/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "secret-pw-12345" }),
    });
    expect(reg.ok).toBe(true);

    const login = await fetch(`http://127.0.0.1:${port}/example/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "secret-pw-12345" }),
    });
    expect(login.ok).toBe(true);
    const cookie = login.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();

    const me = await fetch(`http://127.0.0.1:${port}/example/me`, {
      headers: { cookie },
    }).then((r) => r.json());
    expect(me.email).toBe(email);
  });
});
