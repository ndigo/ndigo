# BlueJS Dispatcher

The BlueJS Dispatcher is a core component that handles routing, handler execution, and error resolution for web applications built with the BlueJS framework.

## Features

- Route mapping and handling
- Handler adapter support for different controller types
- Error resolution with customizable resolvers
- Interceptor support for pre/post processing
- View resolution and rendering

## Package Structure

```
src/
├── dispatcher.ts                 # Main dispatcher implementation
├── error.ts                      # Custom error types
├── route-condition.ts            # Route condition handling
├── route-error-resolver.ts       # Error resolution logic
├── route-handler-adapter.ts      # Handler adapter implementations
├── route-handler-execution-chain.ts  # Execution chain management
├── route-handler-interceptor.ts  # Interceptor support
├── route-handler-method.ts       # Handler method abstraction
├── route-mapping-info.ts         # Route mapping information
├── zod-validated-by.ts           # Zod-backed request validation (AD-7)
└── strategies/                   # Strategy implementations
```

## Request Validation (AD-7)

`@routeParams` extractors compose with Zod schemas: every platform resolver
runs a post-conversion `convert` hook, so validation + coercion apply
uniformly across Node and browser pipelines.

```ts
import { z } from 'zod';
import { routeParams, queryValue, validatedBy, validatedBody, validatedQuery } from '@blue/dispatcher';

@routeParams({ email: validatedBy(z.email(), queryValue('email')) })  // per-field
@routeParams({ note: validatedBody(NoteSchema) })                    // whole body (Node)
@routeParams({ search: validatedQuery(SearchSchema) })               // whole query
@routeParams(validateParams(UserSchema, { user: bindValue('query') })) // whole map
```

Failures surface as `ParameterConversionError`, which the Node pipeline
renders as a `422` problem document with structured `errors[]` (AD-10).
Full walkthrough: [`docs/guides/02-request-validation.md`](../../docs/guides/02-request-validation.md).

## Error Resolution

`RouteErrorResolver` chain (metadata-driven `@errorMapping` handlers +
platform defaults + a last-resort resolver) gives every error a
deterministic status. See
[`docs/guides/01-building-a-node-api.md`](../../docs/guides/01-building-a-node-api.md#6-the-error-contract-rfc-9457).

## Building

```bash
pnpm build
```

## Testing

```bash
pnpm test
```
