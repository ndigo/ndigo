# Blue Model

Blue Model exposes object model primitives and typed model/event helpers for BlueJS.

## Features

- Re-exported `objectmodel` integration layer
- Basic model/event abstractions
- Runtime schema validation
- Model-centric contracts for higher-layer packages

## Installation

```bash
pnpm add @blue/model
```

## Usage

```typescript
import { Model } from '@blue/model';

const User = Model({
    name: String,
});

const user = new User({ name: 'alice' });
user.name;
```

## Development

```bash
pnpm --filter @blue/model build:lib
pnpm --filter @blue/model test
```
