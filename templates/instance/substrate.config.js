import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  port: Number(process.env.PORT ?? 3000),
  appsDir: resolve(__dirname, "apps"),
  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  },
  postgres: {
    url: process.env.DATABASE_URL ?? "postgres://substrate:substrate@localhost:5432/substrate",
  },
};
