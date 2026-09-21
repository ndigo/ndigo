# blue-island — Hybrid Island Demo

> Hybrid SSR + client island demo: EJS server shell, hydrated Web Component, and SSE model push.

Node server renders a Web Component island inside an EJS shell; the client
hydrates it; model updates push from the server over SSE.

## Run

```bash
cd apps/blue-island && pnpm dev
# GET http://127.0.0.1:3001/
# GET http://127.0.0.1:3001/events   (SSE stream)
```

## Demonstrates

- Server-side EJS rendering (`@blue/view-ejs`) of a shell document containing
  `<todo-app data-blue-island data-blue-model="…">`
- Web Component island hydration (`@blue/view-webcomponent`) from the baked-in
  model
- Server-push model updates over Server-Sent Events (`ServerSentEventView`)
  bridged to `@blue/signals` on the client

## Development

```bash
cd apps/blue-island && pnpm test   # SSR shell, static client, SSE order
```

## See Also

- [apps/README](../README.md) — the applications progression
- [@blue/view-ejs](../../packages/blue-view-ejs/README.md) — the EJS technology

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
