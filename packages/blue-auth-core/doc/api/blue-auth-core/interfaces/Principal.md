[**@blue/auth-core v0.0.1**](../../README.md)

***

[@blue/auth-core](../../README.md) / [blue-auth-core](../README.md) / Principal

# Interface: Principal

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

#### Returns

`boolean`

***

### hasRole()

> **hasRole**(`role`): `boolean`

Returns `true` if this principal has the given role.

#### Parameters

##### role

`string`

#### Returns

`boolean`
