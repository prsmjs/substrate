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
  auth: {
    session: {
      secret: process.env.SESSION_SECRET ?? "substrate-dev-secret-change-me",
      name: "substrate.sid",
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
    tablePrefix: "auth_",
    roles: ["user", "admin"],
  },
};
