[**@ndigo/auth-client v0.0.1**](../README.md)

***

[@ndigo/auth-client](../README.md) / AnonymousPrincipal

# Class: AnonymousPrincipal

Sentinel principal representing an unauthenticated user.

## Implements

- [`Principal`](../interfaces/Principal.md)

## Constructors

### Constructor

> **new AnonymousPrincipal**(): `AnonymousPrincipal`

#### Returns

`AnonymousPrincipal`

## Properties

### id

> `readonly` **id**: `"anonymous"` = `"anonymous"`

Unique identifier for this principal.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`id`](../interfaces/Principal.md#id)

***

### name

> `readonly` **name**: `"Anonymous"` = `"Anonymous"`

Human-readable display name.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`name`](../interfaces/Principal.md#name)

***

### roles

> `readonly` **roles**: readonly `string`[]

Roles assigned to this principal.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`roles`](../interfaces/Principal.md#roles)

## Methods

### hasAnyRole()

> **hasAnyRole**(...`_roles`): `boolean`

Returns `true` if this principal has **at least one** of the given roles.

#### Parameters

##### \_roles

...`string`[]

#### Returns

`boolean`

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`hasAnyRole`](../interfaces/Principal.md#hasanyrole)

***

### hasRole()

> **hasRole**(`_role`): `boolean`

Returns `true` if this principal has the given role.

#### Parameters

##### \_role

`string`

#### Returns

`boolean`

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`hasRole`](../interfaces/Principal.md#hasrole)
