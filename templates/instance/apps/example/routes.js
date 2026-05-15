export default function register(router, context) {
  router.get("/", (req, res) => {
    res.json({ app: "example", manifests: context.manifests.length });
  });
}
