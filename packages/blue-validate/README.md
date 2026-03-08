# Blue Validate

Blue Validate provides validation constraints, formats, and validator orchestration for BlueJS.

## Features

- Built-in format and constraint modules
- Validation types and type-aware checks
- Composable `Validator` API
- Integrates with `@blue/core` primitives

## Installation

```bash
pnpm add @blue/validate
```

## Usage

```typescript
import { Validator } from '@blue/validate';

const validator = new Validator();
validator;
```

## Development

```bash
pnpm --filter @blue/validate build:lib
pnpm --filter @blue/validate test
```
