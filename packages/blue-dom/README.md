# @blue/dom

> Browser and server-side (linkedom) DOM providers for BlueJS — isomorphic Web Component rendering.

DOM abstraction layer for BlueJS. Provides browser DOM and server-side (linkedom) DOM providers, enabling isomorphic rendering of Web Components across client and server runtimes.

## Installation

```bash
pnpm add @blue/dom
```

## Getting Started

```typescript
import { BrowserDOMProvider } from '@blue/dom';

const provider = new BrowserDOMProvider();
const el = provider.createElement('div');
el.textContent = 'Hello';
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/index.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.

- `DOMProvider` — interface for platform-agnostic DOM creation
- `BrowserDOMProvider` — browser implementation
- `LinkedomDOMProvider` — server-side implementation via linkedom
- `createDOMProvider` — factory to auto-detect the environment

## Development

```bash
pnpm --filter @blue/dom build:lib
pnpm --filter @blue/dom test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
