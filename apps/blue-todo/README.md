# @blue/todo — Blue Demo Web

> TodoMVC built on the full BlueJS browser stack with a micro frontend shell.

TodoMVC implemented on BlueJS with a micro frontend shell: feature mount
manager, relay gateway, and feature routing registry.

## Run

```bash
cd apps/blue-todo && pnpm dev
```

## Demonstrates

- The BlueJS browser stack end to end: context, routes, views, signals, and
  Web Components
- Micro frontend shell: feature mount manager, relay gateway, and
  `FeatureRoutingRegistry` (`@blue/router`)
- Auth-guarded routes (`@blue/auth-client`): `/auth/profile` requires sign-in,
  `/auth/admin` requires the `admin` role; rejected navigations redirect to
  `/auth/login` / `/auth/forbidden` (demo credentials: `admin`/`demo`, `alice`/`demo`)
- Feature metrics panel, browser telemetry, and real relay traffic
  (`todo:stats:updated` → `site:nav:badge:update`)

## Development

```bash
cd apps/blue-todo && pnpm test
```

## End-to-end tests

```bash
cd apps/blue-todo && pnpm test:e2e   # builds dist/ first, then Playwright
```

## See Also

- [apps/README](../README.md) — the applications progression
- [@blue/host](../../packages/blue-host/README.md) — host orchestration
- [@blue/signals](../../packages/blue-signals/README.md) — reactive state

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
