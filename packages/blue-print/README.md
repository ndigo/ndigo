# Blue Fingerprint

Blue Fingerprint provides browser fingerprint generation for BlueJS applications.

## Features

- Async fingerprint generation API
- Thin wrapper around `@fingerprintjs/fingerprintjs`
- ESM-compatible export for browser usage

## Installation

```bash
pnpm add @blue/print
```

## Usage

```typescript
import { fingerprint } from '@blue/print';

fingerprint.then((value) => value);
```

## Development

```bash
pnpm --filter @blue/print build:lib
pnpm --filter @blue/print test
```
