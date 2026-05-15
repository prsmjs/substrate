import { defineApp } from "@prsm/substrate";

export default defineApp({
  name: "example",
  basePath: "/example",
  routes: "./routes.js",
  workflows: "./workflows.js",
  cells: "./cells.js",
  records: ["example/*"],
  channels: ["example/*"],
});
