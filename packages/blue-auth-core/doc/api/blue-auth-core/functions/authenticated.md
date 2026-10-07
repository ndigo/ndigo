[**@blue/auth-core v0.0.1**](../../README.md)

***

[@blue/auth-core](../../README.md) / [blue-auth-core](../README.md) / authenticated

# Function: authenticated()

> **authenticated**(`target`, `context`): `void`

Marks a class or method as requiring authentication.

This is a passive metadata decorator. The actual enforcement is handled
by the `AuthRouteGuard` (server-side) or `ClientAuthGuard` (client-side).

## Parameters

### target

`unknown`

### context

`ClassDecoratorContext`\<(...`args`) => `any`\> \| `ClassMethodDecoratorContext`\<`unknown`, (`this`, ...`args`) => `any`\>

## Returns

`void`
