# @blue/hello-node — Blue Hello Node

Minimal Node HTTP server on the BlueJS Node platform foundation: one
controller, `@getMapping`, JSON out.

## Run

```bash
cd apps/blue-hello-node && pnpm start
# GET http://127.0.0.1:3000/hello?name=Blue
```

## Demonstrates

- `HTTPServer` + `NodeDispatcher` wiring without a full boot
- A single `@getMapping` controller and query-parameter binding

## See Also

- [apps/README](../README.md) — the applications progression
- [@blue/platform-node](../../packages/blue-platform-node/README.md) — the
  Node platform foundation