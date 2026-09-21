# @blue/host-demo — Micro Frontend Host

> Micro frontend host shell that mounts lazy-loaded feature chunks via `@blue/host`.

Browser shell that mounts three lazy-loaded feature chunks (catalog,
checkout, reports) through the `@blue/host` package.

## Run

```bash
cd apps/blue-host && pnpm dev
# navigate to /catalog, /checkout, /reports
```

## Demonstrates

- `HostManager`-based shell with exclusive feature activation
- Lazy feature chunks via `mountLazy` + dynamic `import()` — build output
  shows `catalog-*.js`, `checkout-*.js`, `reports-*.js` fetched on demand
- Shared-dependency validation between shell and features

## Development

```bash
cd apps/blue-host && pnpm build
```

## See Also

- [apps/README](../README.md) — the applications progression
- [@blue/host](../../packages/blue-host/README.md) — the orchestration package

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
