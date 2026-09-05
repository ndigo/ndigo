# Blue Validate

Blue Validate provides validation constraints, formats, and validator orchestration for BlueJS.

## Features

- Built-in format and constraint modules
- Validation types and type-aware checks
- Constraint and type registration APIs (`registerConstraint`, `registerType`)
- Validation groups (`validationGroup`, `defaultValidationGroup`)
- Decorator-based validation with blocking/non-blocking modes
- Composable `TypeValidator` API
- Deep integration with `@blue/dispatcher` for route parameter validation
- Integrates with `@blue/core` primitives

## Installation

```bash
pnpm add @blue/validate
```

## Usage

```typescript
import { TypeValidator, createTypeValidator, types, registerConstraint, constrained, pattern } from '@blue/validate';

registerConstraint('AlwaysTrue', {
    validate: () => true,
});

const validator = new TypeValidator(types);
validator.validate('abc123', 'UserId', {});

const hybridValidator = createTypeValidator(types, 'hybrid');
hybridValidator.validate('test@test.com', 'Email', {});

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

### Route Parameter Validation

`validatedBy()` allows you to wrap `@blue/dispatcher` parameter extractors with Zod schemas or `@blue/validate` validators.

```typescript
import { routeMapping, routeParams, bindValue } from '@blue/dispatcher';
import { validatedBy } from '@blue/validate';
import { z } from 'zod';

const UserSchema = z.object({
    name: z.string().min(2),
    age: z.coerce.number().min(18),
});

@routeMapping('/users')
class UserController {
    @routeMapping('/create')
    @routeParams({
        user: validatedBy(UserSchema, bindValue('query')),
    })
    create(user: z.infer<typeof UserSchema>) {
        return user.name;
    }
}
```

Validation failures are automatically wrapped in `ParameterConversionError` and can be handled by a `RouteErrorResolver`.

## Development

```bash
pnpm --filter @blue/validate build:lib
pnpm --filter @blue/validate test
```
