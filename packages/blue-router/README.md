# Blue Router

Blue Router provides routing primitives and hash-router implementations for BlueJS.

## Features

- `HashRouter` implementation
- Route/path abstractions (`Route`, `PathRoute`)
- Query-string and matrix-string helpers
- Interceptor registry for route execution

## Installation

```bash
pnpm add @blue/router
```

## Usage

```typescript
import { PathRoute } from '@blue/router';

const route = new PathRoute('/users/1');
route.path;
```

## Development

```bash
pnpm --filter @blue/router build:lib
pnpm --filter @blue/router test
```
