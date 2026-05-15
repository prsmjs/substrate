import express from "express";
import { loadManifests } from "./manifest.js";
import { mountApps } from "./apps.js";

export async function createSubstrate(config) {
  if (!config) throw new Error("createSubstrate: config is required");
  if (!config.appsDir) throw new Error("createSubstrate: config.appsDir is required");

  const app = express();
  const manifests = await loadManifests(config.appsDir);

  const context = {
    config,
    manifests,
    services: {},
  };

  await mountApps(app, manifests, context);

  return {
    app,
    manifests,
    context,
    async listen(port = config.port ?? 3000) {
      return new Promise((resolve) => {
        const server = app.listen(port, () => resolve(server));
      });
    },
  };
}

export { defineApp } from "./manifest.js";
