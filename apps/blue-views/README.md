# blue-views — View Resolution Demo

> View-resolution demo: three resolvers serving one view name from three locations.

Three resolvers, three view locations (component module, context bean, and
content-negotiated representation family) for the same logical view name.

## Run

```bash
cd apps/blue-views && pnpm dev
```

## Demonstrates

- `ContentNegotiationViewResolver` with a `PathExtensionContentNegotiationStrategy`
  — the same `report` view served as JSON or CSV by path extension
- A `ViewResolverComposite` over component-module and context-bean resolvers
- i18n/themes via `@blue/content` and an HTTP client with offline queueing
  (`@blue/platform-web`)

## Development

```bash
cd apps/blue-views && pnpm test
```

## See Also

- [apps/README](../README.md) — the applications progression
- [@blue/view](../../packages/blue-view/README.md) — view resolution and
  content negotiation

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
