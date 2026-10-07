# blue-island — Hybrid Island Demo

> Hybrid SSR + client island demo: EJS server shell, hydrated Web Component, and SSE model push.

Node server renders a Web Component island inside an EJS shell; the client
hydrates it; model updates push from the server over SSE.

## Run

```bash
cd apps/blue-island && pnpm dev
# GET  http://127.0.0.1:3200/
# GET  http://127.0.0.1:3200/events   (SSE stream)
# POST http://127.0.0.1:3200/items    (urlencoded form: text=…)
```

## Demonstrates

- Server-side EJS rendering (`@blue/view-ejs`) of a shell document containing
  `<todo-app data-blue-island data-blue-model="…">`
- Web Component island hydration (`@blue/view-webcomponent`) from the baked-in
  model
- Server-push model updates over Server-Sent Events (`ServerSentEventView`)
  bridged to `@blue/signals` on the client
- **Component-library reference integration (AD-71)**: Web Awesome imported
  per component (no wrappers) — the add-item form's form-associated controls
  submit ordinary `application/x-www-form-urlencoded` data to `POST /items`,
  bound and validated through the standard `dataBinderValue` + Zod path, and
  the resulting model update reaches every client over SSE. The theme is the
  library's token stylesheet plus `--wa-*` overrides from the shell. See
  [guide 21](../../docs/guides/21-component-integration.md).

## Development

```bash
cd apps/blue-island && pnpm test   # SSR shell, hydration, form endpoint, static client, SSE order
```

## See Also

- [apps/README](../README.md) — the applications progression
- [Guide 21 — Component Integration](../../docs/guides/21-component-integration.md) — the library adoption pattern this app demonstrates
- [@blue/view-ejs](../../packages/blue-view-ejs/README.md) — the EJS technology

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
