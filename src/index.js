import { createServer } from "node:http";
import express from "express";
import { loadManifests } from "./manifest.js";
import { mountApps } from "./apps.js";
import { bootServices } from "./services.js";

export async function createSubstrate(config) {
  if (!config) throw new Error("createSubstrate: config is required");
  if (!config.appsDir) throw new Error("createSubstrate: config.appsDir is required");

  const app = express();
  const manifests = await loadManifests(config.appsDir);

  const { services, close: closeServices } = await bootServices(config, manifests);

  const context = {
    config,
    manifests,
    services,
  };

  await mountApps(app, manifests, context);

  let httpServer = null;

  return {
    app,
    manifests,
    context,
    services,
    async listen(port = config.port ?? 3000) {
      httpServer = createServer(app);
      if (services.realtime) {
        await services.realtime.attach(httpServer, { port });
      } else {
        await new Promise((resolve) => httpServer.listen(port, resolve));
      }
      return httpServer;
    },
    async close() {
      if (httpServer) {
        await new Promise((resolve) => httpServer.close(resolve));
        httpServer = null;
      }
      await closeServices();
    },
  };
}

export { defineApp } from "./manifest.js";
