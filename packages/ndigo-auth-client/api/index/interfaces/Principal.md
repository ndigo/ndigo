[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [index](../README.md) / Principal

# Interface: Principal

Represents an authenticated user or entity in the system.

## Properties

### id

> `readonly` **id**: `string`

Unique identifier for this principal.

***

### name

> `readonly` **name**: `string`

Human-readable display name.

***

### roles

> `readonly` **roles**: readonly `string`[]

Roles assigned to this principal.

## Methods

### hasAnyRole()

> **hasAnyRole**(...`roles`): `boolean`

Returns `true` if this principal has **at least one** of the given roles.

#### Parameters

##### roles

...`string`[]

The role names to test.

#### Returns

`boolean`

Whether any role is assigned.

***

### hasRole()

> **hasRole**(`role`): `boolean`

Returns `true` if this principal has the given role.

#### Parameters

##### role

`string`

The role name to test.

#### Returns

`boolean`

Whether the role is assigned.
