[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [decorators](../README.md) / authorized

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

(`target`, `context`) => `void`
