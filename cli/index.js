#!/usr/bin/env node
import { argv, exit } from "node:process";

const [, , command, ...rest] = argv;

const commands = {
  init: () => import("./init.js").then((m) => m.run(rest)),
  new: () => import("./new-app.js").then((m) => m.run(rest)),
  help: () => printHelp(),
};

function printHelp() {
  console.log(`substrate

  substrate init <name>     scaffold a new substrate instance as its own git repo
  substrate new <app>       add an app to the current substrate instance
  substrate help            show this message
`);
}

if (!command || command === "--help" || command === "-h") {
  printHelp();
  exit(0);
}

const handler = commands[command];
if (!handler) {
  console.error(`unknown command: ${command}`);
  printHelp();
  exit(1);
}

handler().catch((err) => {
  console.error(err.message);
  exit(1);
});
