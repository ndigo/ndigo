[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [index](../README.md) / authorized

# Function: authorized()

> **authorized**(`role`): (`target`, `context`) => `void`

Marks a class or method as requiring a specific role.

Multiple `@authorized` decorators may be stacked — all declared roles must
be present on the principal for access to be granted.

This is a passive metadata decorator.

## Parameters

### role

`string`

The role name that the principal must possess.

## Returns

The class/method decorator.

(`target`, `context`) => `void`

## Example

```ts
class AdminController {
    @authorized('admin')
    deleteAll(): void {}
}
```
