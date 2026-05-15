export default function register(router, context) {
  router.get("/", (req, res) => {
    res.json({
      app: "example",
      manifests: context.manifests.length,
      services: Object.fromEntries(
        Object.entries(context.services).map(([k, v]) => [k, v != null]),
      ),
    });
  });

  router.post("/greet/:name", async (req, res) => {
    if (!context.services.workflow) {
      return res.status(503).json({ error: "workflow service not running" });
    }
    const execution = await context.services.workflow.start("greet", { name: req.params.name });
    res.json({ executionId: execution.id, status: execution.status });
  });

  router.get("/counter", (req, res) => {
    const value = context.services.cells?.value?.("counter");
    res.json({ counter: value ?? null });
  });
}
