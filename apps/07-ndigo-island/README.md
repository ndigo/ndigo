# ndigo-island — Hybrid Island Demo

> Hybrid SSR + client island demo: EJS server shell, hydrated Web Component, and SSE model push.

Node server renders a Web Component island inside an EJS shell; the client
hydrates it; model updates push from the server over SSE.

## Run

```bash
cd apps/07-ndigo-island && pnpm dev
# GET  http://127.0.0.1:3200/
# GET  http://127.0.0.1:3200/events   (SSE stream)
# POST http://127.0.0.1:3200/items    (urlencoded form: text=…)
```

## Demonstrates

- Server-side EJS rendering (`@ndigo/view-ejs`) of a shell document containing
  `<todo-app data-ndigo-island data-ndigo-model="…">`
- Web Component island hydration (`@ndigo/view-webcomponent`) from the baked-in
  model
- Server-push model updates over Server-Sent Events (`ServerSentEventView`)
  bridged to `@ndigo/signals` on the client. The server coalesces pending
  snapshots (one newest snapshot per client, bound 1, APP-D); the client
  resubscribes with bounded exponential backoff after the stream ends and shows
  the connection state in its status line (WC-G). Disconnecting the island
  releases its render effect and SSE subscription (WC-F).
- **Component-library reference integration (AD-71)**: Web Awesome imported
  per component (no wrappers) — the add-item form's form-associated controls
  submit ordinary `application/x-www-form-urlencoded` data to `POST /items`,
  bound and validated through the standard `dataBinderValue` + Zod path, and
  the resulting model update reaches every client over SSE. The theme is the
  library's token stylesheet plus `--wa-*` overrides from the shell. See
  [guide 30](../../docs/guides/30-component-integration.md).
- The library's `with-clear` icon is fetched from a `data:` URL, so the demo
  widens the CSP `connect-src` (via the `SecurityHeadersInterceptor` seam) —
  see guide 30 §9.

## Development

```bash
cd apps/07-ndigo-island && pnpm test       # SSR shell, hydration, form endpoint, static client, SSE coalescing, lifecycle, CSP wiring
cd apps/07-ndigo-island && pnpm test:e2e   # Playwright browser lane (starts the server on port 3280)
```

## See Also

- [apps/README](../README.md) — the applications progression
- [Guide 30 — Component Integration](../../docs/guides/30-component-integration.md) — the library adoption pattern this app demonstrates
- [@ndigo/view-ejs](../../packages/ndigo-view-ejs/README.md) — the EJS technology

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
