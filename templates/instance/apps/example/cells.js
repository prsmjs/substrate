export default function register(graph) {
  const counter = graph.cell("counter", 0);
  graph.cell("doubled", () => counter() * 2);
}
