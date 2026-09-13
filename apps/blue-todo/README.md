# @blue/todo — Blue Demo Web

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
- Auth-guarded routes (`@blue/auth-core`), feature metrics panel, and
  browser telemetry
- End-to-end Playwright suite under `e2e/`

## See Also

- [apps/README](../README.md) — the applications progression
- [@blue/host](../../packages/blue-host/README.md) — host orchestration
- [@blue/signals](../../packages/blue-signals/README.md) — reactive state