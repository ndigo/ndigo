---
name: ndigo-endpoint
description: Adds and validates HTTP and WebSocket endpoints. Use when creating controllers, binding request data, validating input, or shaping errors.
---

# Endpoints: routes, binding, validation, errors

## The surface

| Need                 | Decorator or API                                                          |
| :------------------- | :------------------------------------------------------------------------ |
| Class path context   | `@requestMapping('/api/orders')`                                          |
| Method route         | `@getMapping('/:id')`, `@postMapping`, `@putMapping`, `@deleteMapping`    |
| Any method or custom | `@requestMapping({ value, method })`                                      |
| Binding              | `@parameters({ id: pathValue(), q: queryValue('q'), body: bodyValue() })` |
| Validation           | `@validatedBy(Schema)`, `@validatedBody`, `@validatedQuery`               |
| Errors               | `@errorMapping`, RFC 9457 problem details                                 |
| WebSocket            | `@socketMapping('/chat')`                                                 |

## Sequence

1. Put the class under `src/` with `@requestMapping` and method decorators.
2. Bind every handler parameter explicitly; an unbound required parameter is a
   400, not a guessed value.
3. Validate with the Zod schema that also feeds the OpenAPI document; do not
   hand-write a second schema.
4. Register the controller in the application assembly.
5. Verify: `ndigo inspect` (route, mapping, parameters), `ndigo openapi`, then a
   request against `ndigo dev`.

## Traps

- **Decorators are camelCase and TC39 stage-3.** Do not enable
  `experimentalDecorators` or `emitDecoratorMetadata`; legacy forms break.
- **A class-level verb decorator is a configuration error.** `@requestMapping`
  may sit on the class; `@getMapping` and `@postMapping` belong on methods.
- **Binding sources are explicit.** Use `pathValue`, `queryValue`, `bodyValue`,
  `dataBinderValue`, `headerValue`, `cookieValue`, `requestPart`, `fileValue`.
  A missing source yields 400 problem+json.

## Verify

`ndigo inspect --json` shows the mapping; `ndigo openapi` includes the operation;
the handler returns the expected status for valid and invalid input.
