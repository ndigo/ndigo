# Blue View

Blue View provides view abstractions and view resolution infrastructure for BlueJS.

## Features

- `View` and `AbstractView` contracts
- View resolver abstractions and composites
- Content-negotiation view resolver utilities
- Integration points for router/context/factory packages

## Installation

```bash
pnpm add @blue/view
```

## Usage

```typescript
import { RerouteView } from '@blue/view';

const view = new RerouteView('/login');
view;
```

## Development

```bash
pnpm --filter @blue/view build:lib
pnpm --filter @blue/view test
```
