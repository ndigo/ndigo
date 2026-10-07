# @blue/view-ejs

> Isomorphic server-side EJS template rendering for BlueJS — runs identically in Node and browser/jsdom with no platform I/O.

`@blue/view-ejs` renders EJS templates into BlueJS views. It is isomorphic — the engine runs identically in Node and in a browser/jsdom test environment; file resolution is delegated to an injected `ResourceLoader`, keeping the package free of platform I/O.

## Installation

```bash
pnpm add @blue/view-ejs
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { EJSViewResolver } from '@blue/view-ejs';

const resolver = new EJSViewResolver({
    prefix: 'views/',
    suffix: '.html',
});

const view = await resolver.resolveViewName('home', 'en'); // views/home.html
```

## Usage

### Rendering a document directly

```ts
import { EJSView } from '@blue/view-ejs';

const view = new EJSView('views/home.html', {
    loader: myResourceLoader, // or set the view's application context
});
const result = await view.renderTo({ name: 'Blue' }, route); // RenderResult
```

### Caching semantics

Path-backed views load their template source once and keep rendering it for the view's lifetime (views are cached per name by the resolver), and the engine compiles each source at most once. Template edits on disk therefore take effect on restart — the tradeoff that buys a filesystem read and a template compile off the render path.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

- **`EJSView`** — a producer view that renders an EJS template into a fragment `ViewTarget` (islands, client-side DOM) or a whole document (servlet-style SSR), per the `ProducerView` contract
- **`EJSTemplateEngine`** — compiles templates once per source string and reuses the compiled function; renders at ~1µs after the first pass
- **`EJSViewResolver`** — path-based resolver mapping logical names through a prefix/suffix (e.g. `views/` + name + `.html`), with an explicit `viewNames` allow-list option

## Development

```bash
pnpm --filter @blue/view-ejs build:lib
pnpm --filter @blue/view-ejs test
```

## See Also

- [@blue/view](../blue-view/README.md) — view contracts, view targets, and content negotiation
- [apps/06-blue-island](../../apps/06-blue-island/README.md) — EJS shell + island hydration demo

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
