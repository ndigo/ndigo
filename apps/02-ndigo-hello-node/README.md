# @ndigo/hello-node — Ndigo Hello Node

> Minimal Node HTTP server on the Ndigo Node platform foundation.

Minimal Node HTTP server on the Ndigo Node platform foundation: one
controller, `@getMapping`, JSON out.

## Run

```bash
cd apps/02-ndigo-hello-node && pnpm start
# GET http://127.0.0.1:3010/hello?name=Ndigo
```

## Demonstrates

- A minimal `ApplicationBuilder` + `NodeAutoConfiguration` boot with one
  controller
- A single `@getMapping` controller and query-parameter binding

## See Also

- [apps/README](../README.md) — the applications progression
- [@ndigo/platform-node](../../packages/ndigo-platform-node/README.md) — the
  Node platform foundation

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
