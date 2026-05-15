import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function mountApps(app, manifests, context) {
  const authEnabled = !!context.services?.auth;
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
    const mountPath = manifest.basePath ?? `/${manifest.name}`;
    const scopes = manifest.auth?.scopes;
    if (authEnabled && Array.isArray(scopes) && scopes.length > 0) {
      app.use(mountPath, scopeCheck(scopes), router);
    } else {
      app.use(mountPath, router);
    }
  }
}

function scopeCheck(scopes) {
  return (req, res, next) => {
    if (!req.auth?.isLoggedIn()) {
      return res.status(401).json({ error: "unauthorized" });
    }
    const userRoles = req.auth.getRoleNames();
    if (!scopes.some((s) => userRoles.includes(s))) {
      return res.status(403).json({ error: "forbidden", required: scopes });
    }
    next();
  };
}
