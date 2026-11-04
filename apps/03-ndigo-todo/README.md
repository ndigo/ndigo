# @ndigo/todo — Ndigo Demo Web

> TodoMVC built on the full Ndigo browser stack with a micro frontend shell.

TodoMVC implemented on Ndigo with a micro frontend shell: feature mount
manager, relay gateway, and feature routing registry.

## Run

```bash
cd apps/03-ndigo-todo && pnpm dev
```

## Demonstrates

- The Ndigo browser stack end to end: context, routes, views, signals, and
  Web Components
- Micro frontend shell: feature mount manager, relay gateway, and
  `FeatureRoutingRegistry` (`@ndigo/router`)
- Auth-guarded routes (`@ndigo/auth-client`): `/auth/profile` requires sign-in,
  `/auth/admin` requires the `admin` role; rejected navigations redirect to
  `/auth/login` / `/auth/forbidden` (demo credentials: `admin`/`demo`, `alice`/`demo`)
- Feature metrics panel, browser telemetry, and real relay traffic
  (`todo:stats:updated` → `site:nav:badge:update`)

## Development

```bash
cd apps/03-ndigo-todo && pnpm test
```

## End-to-end tests

```bash
cd apps/03-ndigo-todo && pnpm test:e2e   # builds dist/ first, then Playwright
```

## See Also

- [apps/README](../README.md) — the applications progression
- [@ndigo/host](../../packages/ndigo-host/README.md) — host orchestration
- [@ndigo/signals](../../packages/ndigo-signals/README.md) — reactive state

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
