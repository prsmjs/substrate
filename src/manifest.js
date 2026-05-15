import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function defineApp(manifest) {
  if (!manifest || typeof manifest !== "object") {
    throw new Error("defineApp: manifest must be an object");
  }
  if (!manifest.name) throw new Error("defineApp: manifest.name is required");
  return manifest;
}

export async function loadManifests(appsDir) {
  const dir = resolve(appsDir);
  const entries = await readdir(dir);
  const manifests = [];

  for (const entry of entries) {
    const appPath = join(dir, entry);
    const info = await stat(appPath).catch(() => null);
    if (!info?.isDirectory()) continue;

    const manifestPath = join(appPath, "manifest.js");
    const url = pathToFileURL(manifestPath).href;
    const mod = await import(url).catch((err) => {
      throw new Error(`failed to load manifest for ${entry}: ${err.message}`);
    });

    const manifest = mod.default ?? mod.manifest;
    if (!manifest) {
      throw new Error(`${entry}/manifest.js must export a default manifest`);
    }

    manifests.push({ ...manifest, dir: appPath });
  }

  return manifests;
}
