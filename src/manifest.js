import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const KNOWN_FIELDS = new Set([
  "name",
  "basePath",
  "routes",
  "workflows",
  "cells",
  "records",
  "channels",
  "migrations",
  "auth",
]);

export function defineApp(manifest) {
  if (!manifest || typeof manifest !== "object") {
    throw new Error("defineApp: manifest must be an object");
  }
  if (!manifest.name) throw new Error("defineApp: manifest.name is required");

  for (const key of ["routes", "workflows", "cells", "migrations"]) {
    if (manifest[key] != null && typeof manifest[key] !== "string") {
      throw new Error(`defineApp: ${key} must be a relative path string`);
    }
  }
  for (const key of ["records", "channels"]) {
    if (manifest[key] != null) {
      if (!Array.isArray(manifest[key])) {
        throw new Error(`defineApp: ${key} must be an array of pattern strings`);
      }
      for (const p of manifest[key]) {
        if (typeof p !== "string") {
          throw new Error(`defineApp: ${key} entries must be strings`);
        }
      }
    }
  }
  if (manifest.auth != null && typeof manifest.auth !== "object") {
    throw new Error("defineApp: auth must be an object");
  }

  for (const key of Object.keys(manifest)) {
    if (!KNOWN_FIELDS.has(key)) {
      throw new Error(`defineApp: unknown field "${key}"`);
    }
  }

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
