[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [decorators](../README.md) / authorizedScopes

# Function: authorizedScopes()

> **authorizedScopes**(...`scopes`): (`target`, `context`) => `void`

Marks a class or method as requiring specific OAuth scopes.

Multiple `@authorizedScopes` decorators may be stacked — every declared
scope must be present on the principal for access to be granted. A route
with scope requirements also requires authentication.

This is a passive metadata decorator.

## Parameters

### scopes

...`string`[]

The scopes the principal must possess.

## Returns

The class/method decorator.

(`target`, `context`) => `void`

## Example

```ts
class OrderTools {
    @authorizedScopes('tools.read')
    listOrders(): void {}
}
```
