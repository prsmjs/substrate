import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function mountApps(app, manifests, context) {
  for (const manifest of manifests) {
    if (!manifest.routes) continue;

    const routesPath = join(manifest.dir, manifest.routes);
    const mod = await import(pathToFileURL(routesPath).href);
    const register = mod.default ?? mod.register;

    if (typeof register !== "function") {
      throw new Error(`${manifest.name}: routes module must default-export a function(router, context)`);
    }

    const router = (await import("express")).Router();
    await register(router, context);
    app.use(manifest.basePath ?? `/${manifest.name}`, router);
  }
}
