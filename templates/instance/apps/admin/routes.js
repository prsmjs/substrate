export default function register(router, context) {
  router.get("/", (req, res) => {
    res.json({
      instance: context.config?.name ?? "substrate",
      services: Object.fromEntries(
        Object.entries(context.services).map(([k, v]) => [k, v != null]),
      ),
      apps: context.manifests.map((m) => ({
        name: m.name,
        basePath: m.basePath,
        routes: m.routes ?? null,
        workflows: m.workflows ?? null,
        cells: m.cells ?? null,
        records: m.records ?? [],
        channels: m.channels ?? [],
      })),
    });
  });

  router.get("/workflows", (req, res) => {
    if (!context.services.workflow) return res.json({ workflows: [] });
    res.json({ workflows: context.services.workflow.listWorkflows() });
  });

  router.get("/cells", (req, res) => {
    if (!context.services.cells) return res.json({ cells: [] });
    res.json({ cells: context.services.cells.cells() });
  });
}
