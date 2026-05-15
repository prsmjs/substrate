export default function register(router, context) {
  router.get("/", (req, res) => {
    res.json({
      instance: context.config?.name ?? "substrate",
      apps: context.manifests.map((m) => ({
        name: m.name,
        basePath: m.basePath,
      })),
    });
  });
}
