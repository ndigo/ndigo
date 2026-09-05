# @blue/dom

DOM abstraction layer for BlueJS. Provides browser DOM and server-side (linkedom) DOM providers, enabling isomorphic rendering of Web Components across client and server runtimes.

## Installation

```bash
pnpm add @blue/dom
```

## Usage

```typescript
import { BrowserDOMProvider } from '@blue/dom';

const provider = new BrowserDOMProvider();
const el = provider.createElement('div');
el.textContent = 'Hello';
```

## Exports

- `DOMProvider` — interface for platform-agnostic DOM creation
- `BrowserDOMProvider` — browser implementation
- `LinkedomDOMProvider` — server-side implementation via linkedom
- `createDOMProvider` — factory to auto-detect the environment
