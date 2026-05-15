import { cp, mkdir, writeFile, readFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, "..", "templates", "instance");

export async function run(args) {
  const name = args[0];
  if (!name) throw new Error("usage: substrate init <name>");

  const target = resolve(process.cwd(), name);
  await mkdir(target, { recursive: true });
  await cp(TEMPLATE_DIR, target, { recursive: true });

  await rewritePackageName(target, name);

  try {
    execSync("git init", { cwd: target, stdio: "ignore" });
  } catch {}

  console.log(`created substrate instance: ${target}`);
  console.log("");
  console.log("next steps:");
  console.log(`  cd ${name}`);
  console.log("  make up      # start postgres + redis");
  console.log("  npm install");
  console.log("  npm start");
}

async function rewritePackageName(target, name) {
  const pkgPath = join(target, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.name = name;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}
