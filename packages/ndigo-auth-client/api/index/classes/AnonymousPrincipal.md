[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [index](../README.md) / AnonymousPrincipal

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

The sentinel id (`'anonymous'`).

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`id`](../interfaces/Principal.md#id)

***

### name

> `readonly` **name**: `"Anonymous"` = `"Anonymous"`

The display name (`'Anonymous'`).

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`name`](../interfaces/Principal.md#name)

***

### roles

> `readonly` **roles**: readonly `string`[]

The empty role set.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`roles`](../interfaces/Principal.md#roles)

***

### scopes

> `readonly` **scopes**: readonly `string`[]

The empty scope set.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`scopes`](../interfaces/Principal.md#scopes)

## Methods

### hasAnyRole()

> **hasAnyRole**(...`_roles`): `boolean`

Always `false` for the anonymous sentinel.

#### Parameters

##### \_roles

...`string`[]

Ignored.

#### Returns

`boolean`

Always `false`.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`hasAnyRole`](../interfaces/Principal.md#hasanyrole)

***

### hasAnyScope()

> **hasAnyScope**(...`_scopes`): `boolean`

Always `false` for the anonymous sentinel.

#### Parameters

##### \_scopes

...`string`[]

Ignored.

#### Returns

`boolean`

Always `false`.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`hasAnyScope`](../interfaces/Principal.md#hasanyscope)

***

### hasRole()

> **hasRole**(`_role`): `boolean`

Always `false` for the anonymous sentinel.

#### Parameters

##### \_role

`string`

Ignored.

#### Returns

`boolean`

Always `false`.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`hasRole`](../interfaces/Principal.md#hasrole)

***

### hasScope()

> **hasScope**(`_scope`): `boolean`

Always `false` for the anonymous sentinel.

#### Parameters

##### \_scope

`string`

Ignored.

#### Returns

`boolean`

Always `false`.

#### Implementation of

[`Principal`](../interfaces/Principal.md).[`hasScope`](../interfaces/Principal.md#hasscope)
