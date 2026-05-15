# substrate-instance

A substrate instance. Stamped from `@prsm/substrate`. Single-tenant: this repo runs one platform with its own Postgres, Redis, and apps.

## Run locally

```
make up
npm install
npm start
```

## Add an app

```
make new-app NAME=billing
```

Apps live in `apps/<name>/` and are wired automatically by `substrate.config.js`.

## Deploy

This repo is set up for [nixpacks](https://nixpacks.com/) builds (Dokploy, Railway, etc). Configure your platform's Postgres and Redis URLs as `DATABASE_URL` and `REDIS_URL`.
