import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run as runInit } from "../cli/init.js";

let scratch;

beforeEach(async () => {
  scratch = await mkdtemp(join(tmpdir(), "substrate-"));
  process.chdir(scratch);
});

afterEach(async () => {
  await rm(scratch, { recursive: true, force: true });
});

describe("substrate init", () => {
  it("scaffolds an instance directory with the template files", async () => {
    await runInit(["my-instance"]);
    const target = join(scratch, "my-instance");

    for (const f of ["package.json", "compose.yml", "Makefile", "server.js", "substrate.config.js", "apps/example/manifest.js", "apps/admin/manifest.js"]) {
      const info = await stat(join(target, f)).catch(() => null);
      expect(info, `expected ${f}`).toBeTruthy();
    }

    const pkg = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
    expect(pkg.name).toBe("my-instance");
  });

  it("requires a name", async () => {
    await expect(runInit([])).rejects.toThrow(/usage/);
  });
});
