# @ndigo/hello — Ndigo Hello

> Minimal Ndigo single-page app: context, one route, and a Web Component view.

Minimal Ndigo SPA: an application context, one route, and a Web Component
view that says hello.

## Run

```bash
cd apps/01-ndigo-hello && pnpm dev
```

## Demonstrates

- The simplest possible `@ndigo` browser application
- Context + route + template/Web Component render
- Vite dev server wiring
- **Decentralized view placement**: the controller returns a realized
  `WebComponentView` and the app registers a single `viewTarget`, so the
  dispatcher's resolver and targeter chains are never consulted
  (`test/decentralized-view.spec.ts` asserts exactly that)

## Centralized vs. decentralized placement

App 01 is the counter-example to a centralized layout. Here the handler owns
both the view and the destination, which is the least ceremony for one screen
but does not scale to pages composed of several regions:

|                             | Decentralized (this app)   | Centralized (`apps/08-ndigo-views`) |
| :-------------------------- | :------------------------- | :---------------------------------- |
| Who decides placement       | Each handler               | One `viewTargeters` configuration   |
| Handler returns             | A view instance            | A view name                         |
| New destination             | Code change in the handler | Entry in the targeter chain         |
| Layout visible in one place | No                         | Yes                                 |
| Dispatcher work             | Skips resolver + targeters | Runs the chains                     |

Both are supported by the same pipeline — see
[guide 09 §7](../../docs/guides/09-views-and-content-negotiation.md).

## Development

```bash
cd apps/01-ndigo-hello && pnpm build
```

## See Also

- [apps/README](../README.md) — the applications progression

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
