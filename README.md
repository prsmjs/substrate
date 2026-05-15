<p align="center">
  <img src=".github/logo.svg" width="80" height="80" alt="substrate logo">
</p>

<h1 align="center">@prsm/substrate</h1>

A distribution for stamping out independent, isolated personal-software platforms. Each instance is its own git repo with its own Postgres, Redis, and apps - one per client, one per project, one per whatever. Instances do not share state and do not know about each other.

This package ships three things:

1. A runtime library (`createSubstrate(config)`) that boots realtime, workflows, a reactive graph, and auth from a single config and mounts apps from a manifest-described directory.
2. A CLI (`substrate init <name>`, `substrate new <app>`) for scaffolding new instances and adding apps to an existing one.
3. A project template - the directory structure an instance starts from, including `compose.yml`, `Makefile`, nixpacks config, and a manifest format.

## Install

```
npm install @prsm/substrate
```

## Create an instance

```
npx @prsm/substrate init client-a
cd client-a
make up
npm install
npm start
```

This produces a fresh git repo with a working Express server, Postgres and Redis ready via `make up`, an example app at `apps/example/`, and a built-in admin app at `/_admin` that lists everything wired into the instance.

## Add an app

Inside an instance:

```
npx substrate new billing
```

This adds `apps/billing/` with a manifest and a routes module. Substrate picks it up automatically on next boot.

## Manifest format

Each app folder declares what it needs in a `manifest.js`:

```js
import { defineApp } from "@prsm/substrate";

export default defineApp({
  name: "billing",
  basePath: "/billing",
  routes: "./routes.js",
});
```

Routes modules export a `register(router, context)` function. The `context` argument exposes shared services (Redis, Postgres, realtime, workflows) that substrate booted from the root config.

## Status

This package is at version 0.0.0 and under active development. The runtime, manifest format, and CLI surface are still being shaped.
