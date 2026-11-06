# @ndigo/dom

> Browser and server-side (linkedom) DOM providers for Ndigo — isomorphic Web Component rendering.

DOM abstraction layer for Ndigo. Provides browser DOM and server-side (linkedom) DOM providers, enabling isomorphic rendering of Web Components across client and server runtimes.

## Installation

```bash
pnpm add @ndigo/dom
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```typescript
import { BrowserDOMProvider } from '@ndigo/dom';

const provider = new BrowserDOMProvider();
const el = provider.createElement('div');
el.textContent = 'Hello';
```

## Usage

### Runtime detection

```ts
import { createDOMProvider } from '@ndigo/dom';

const provider = await createDOMProvider(); // BrowserDOMProvider, or LinkedomDOMProvider on Node
```

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- `DOMProvider` — interface for platform-agnostic DOM creation
- `BrowserDOMProvider` — browser implementation
- `LinkedomDOMProvider` — server-side implementation via linkedom
- `createDOMProvider` — factory to auto-detect the environment

## Development

```bash
pnpm --filter @ndigo/dom build:lib
pnpm --filter @ndigo/dom test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
