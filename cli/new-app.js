import { mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

export async function run(args) {
  const name = args[0];
  if (!name) throw new Error("usage: substrate new <app>");

  const cwd = process.cwd();
  const appsDir = resolve(cwd, "apps");

  const exists = await stat(appsDir).catch(() => null);
  if (!exists) {
    throw new Error("no apps/ directory here. run inside a substrate instance");
  }

  const target = join(appsDir, name);
  await mkdir(target, { recursive: true });

  await writeFile(
    join(target, "manifest.js"),
    `import { defineApp } from "@prsm/substrate";\n\nexport default defineApp({\n  name: "${name}",\n  basePath: "/${name}",\n  routes: "./routes.js",\n});\n`,
  );

  await writeFile(
    join(target, "routes.js"),
    `export default function register(router, context) {\n  router.get("/", (req, res) => {\n    res.json({ app: "${name}" });\n  });\n}\n`,
  );

  console.log(`created app: apps/${name}`);
}
