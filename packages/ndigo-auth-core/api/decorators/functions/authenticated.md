[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [decorators](../README.md) / authenticated

# Function: authenticated()

> **authenticated**(`target`, `context`): `void`

Marks a class or method as requiring authentication.

This is a passive metadata decorator. The actual enforcement is handled
by the `AuthRouteGuard` (server-side) or `ClientAuthGuard` (client-side).

## Parameters

### target

`unknown`

The decorated class or method.

### context

`ClassDecoratorContext`\<new (...`args`) => `any`\> \| `ClassMethodDecoratorContext`\<`unknown`, (`this`, ...`args`) => `any`\>

The decorator context.

## Returns

`void`

Nothing; metadata is recorded on the context.
