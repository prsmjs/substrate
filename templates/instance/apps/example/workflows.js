import { defineWorkflow } from "@prsm/workflow";

export default function register(engine) {
  engine.register(
    defineWorkflow({
      name: "greet",
      version: "1",
      start: "say-hello",
      steps: {
        "say-hello": {
          type: "activity",
          async run({ input }) {
            return { message: `hello, ${input.name}` };
          },
        },
      },
    }),
  );
}
