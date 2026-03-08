# Blue Validate

Blue Validate provides validation constraints, formats, and validator orchestration for BlueJS.

## Features

- Built-in format and constraint modules
- Validation types and type-aware checks
- Constraint and type registration APIs (`registerConstraint`, `registerType`)
- Validation groups (`validationGroup`, `defaultValidationGroup`)
- Decorator-based validation with blocking/non-blocking modes
- Composable `TypeValidator` API
- Integrates with `@blue/core` primitives

## Installation

```bash
pnpm add @blue/validate
```

## Usage

```typescript
import { TypeValidator, types, registerConstraint, constrained, pattern } from '@blue/validate';

registerConstraint('AlwaysTrue', {
    validate: () => true,
});

const validator = new TypeValidator(types);
validator.validate('abc123', 'UserId', {});

class User {
    @pattern({ regex: /^[a-z]+$/ })
    username: string;

    @constrained({
        constraint: 'AlwaysTrue',
        mode: 'non-blocking',
    })
    custom: string;
}
```

## Development

```bash
pnpm --filter @blue/validate build:lib
pnpm --filter @blue/validate test
```
