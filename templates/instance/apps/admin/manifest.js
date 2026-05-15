import { defineApp } from "@prsm/substrate";

export default defineApp({
  name: "admin",
  basePath: "/_admin",
  routes: "./routes.js",
});
