import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function ioredisOpts(redisConfig) {
  if (!redisConfig) return null;
  if (redisConfig.url) {
    const u = new URL(redisConfig.url);
    return {
      host: u.hostname,
      port: Number(u.port || 6379),
      password: u.password ? decodeURIComponent(u.password) : undefined,
      db: u.pathname ? Number(u.pathname.slice(1) || 0) : 0,
    };
  }
  return { ...redisConfig };
}

export function nodeRedisOpts(redisConfig) {
  if (!redisConfig) return null;
  if (redisConfig.url) return { url: redisConfig.url };
  const opts = { socket: { host: redisConfig.host, port: redisConfig.port } };
  if (redisConfig.password) opts.password = redisConfig.password;
  if (redisConfig.db != null) opts.database = redisConfig.db;
  return opts;
}

export async function bootServices(config, manifests) {
  const services = {
    pg: null,
    redis: null,
    realtime: null,
    workflow: null,
    cells: null,
  };
  const cleanups = [];

  if (config.postgres) {
    const { Pool } = await import("pg");
    services.pg = new Pool(
      config.postgres.url
        ? { connectionString: config.postgres.url, ...config.postgres.pool }
        : { ...config.postgres },
    );
    cleanups.push(() => services.pg.end());
  }

  if (config.redis) {
    const { createClient } = await import("redis");
    services.redis = createClient(nodeRedisOpts(config.redis));
    services.redis.on("error", () => {});
    await services.redis.connect();
    cleanups.push(() => services.redis.quit().catch(() => {}));
  }

  if (config.redis) {
    const { RealtimeServer } = await import("@prsm/realtime");
    services.realtime = new RealtimeServer({
      ...config.realtime,
      redis: ioredisOpts(config.redis),
    });
    cleanups.push(() => services.realtime.close?.().catch?.(() => {}));
  }

  if (config.postgres) {
    const { WorkflowEngine } = await import("@prsm/workflow");
    const { default: postgresDriver } = await import("@prsm/workflow/postgres");
    const storage = postgresDriver({
      connectionString: config.postgres.url,
      ...config.workflow?.storage,
    });
    services.workflow = new WorkflowEngine({
      storage,
      ...config.workflow?.engine,
    });
    await services.workflow.ready();
    cleanups.push(async () => {
      if (services.workflow._pollTimer) clearInterval(services.workflow._pollTimer);
      await storage.close?.().catch?.(() => {});
    });
  }

  if (config.redis) {
    const { createGraph } = await import("@prsm/cells");
    services.cells = createGraph({
      ...config.cells,
      redis: ioredisOpts(config.redis),
    });
    cleanups.push(() => services.cells.destroy?.().catch?.(() => {}));
  }

  for (const m of manifests) {
    if (m.workflows && services.workflow) {
      const mod = await loadAppModule(m, m.workflows);
      const register = mod.default ?? mod.register;
      if (typeof register !== "function") {
        throw new Error(`${m.name}: workflows module must default-export a function(engine, context)`);
      }
      await register(services.workflow, { config, manifests, services });
    }
    if (m.cells && services.cells) {
      const mod = await loadAppModule(m, m.cells);
      const register = mod.default ?? mod.register;
      if (typeof register !== "function") {
        throw new Error(`${m.name}: cells module must default-export a function(graph, context)`);
      }
      await register(services.cells, { config, manifests, services });
    }
  }

  return {
    services,
    async close() {
      for (const fn of cleanups.reverse()) {
        try { await fn(); } catch {}
      }
    },
  };
}

async function loadAppModule(manifest, relPath) {
  const abs = join(manifest.dir, relPath);
  return import(pathToFileURL(abs).href);
}
