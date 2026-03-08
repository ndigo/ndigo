# Blue Core

Blue Core is the foundational package for shared primitives, contracts, and utilities in BlueJS.

## Features

- Core types (`Null`, `Enumerable`, `Constructable`, etc.)
- Async primitive: `Deferred`
- Media type parsing and constants (`MediaType`, `MediaTypes`)
- Error base types and utility abstractions
- Collection/transducer and matcher utilities

## Installation

```bash
pnpm add @blue/core
```

## Usage

```typescript
import { Deferred } from '@blue/core';

const deferred = new Deferred<string>();

deferred.promise.then((value) => value);
deferred.resolve('ok');
```

## Development

```bash
pnpm --filter @blue/core build:lib
pnpm --filter @blue/core test
```
