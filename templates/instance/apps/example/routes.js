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

  router.post("/register", async (req, res) => {
    if (!req.auth) return res.status(503).json({ error: "auth service not running" });
    try {
      const account = await req.auth.register(req.body.email, req.body.password);
      res.json({ accountId: account.id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post("/login", async (req, res) => {
    if (!req.auth) return res.status(503).json({ error: "auth service not running" });
    try {
      await req.auth.login(req.body.email, req.body.password);
      res.json({ ok: true });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  });

  router.post("/logout", async (req, res) => {
    if (!req.auth) return res.status(503).json({ error: "auth service not running" });
    await req.auth.logout();
    res.json({ ok: true });
  });

  router.get("/me", (req, res) => {
    if (!req.auth?.isLoggedIn()) return res.status(401).json({ error: "not logged in" });
    res.json({
      email: req.auth.getEmail(),
      roles: req.auth.getRoleNames(),
    });
  });
}
