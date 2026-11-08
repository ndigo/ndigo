[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [principal](../README.md) / DefaultPrincipal

# Class: DefaultPrincipal

The framework's concrete principal, used by authentication adapters to
materialize identities from user records (e.g.
`CredentialsAuthAdapter` — AD-33 D-5).

## Implements

- [`Principal`](../interfaces/Principal.md)

## Constructors

### Constructor

> **new DefaultPrincipal**(`id`, `name`, `roles?`): `DefaultPrincipal`

#### Parameters

##### id

`string`

##### name

`string`

##### roles?

readonly `string`[] = `[]`

#### Returns

`DefaultPrincipal`

## Properties

### id

> `readonly` **id**: `string`

Unique identifier for this principal.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`id`](../interfaces/Principal.md#id)

***

### name

> `readonly` **name**: `string`

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

> **hasAnyRole**(...`roles`): `boolean`

Returns `true` if this principal has at least one of the given roles.

#### Parameters

##### roles

...`string`[]

The role names to test.

#### Returns

`boolean`

Whether any role is assigned.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`hasAnyRole`](../interfaces/Principal.md#hasanyrole)

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

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`hasRole`](../interfaces/Principal.md#hasrole)
