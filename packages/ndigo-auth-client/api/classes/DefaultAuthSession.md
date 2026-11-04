[**@ndigo/auth-client v0.0.1**](../README.md)

***

[@ndigo/auth-client](../README.md) / DefaultAuthSession

# Class: DefaultAuthSession

Default implementation of [AuthSession](../interfaces/AuthSession.md).

Stores the principal and token in private fields. Starts in an
unauthenticated state with no principal or token.

## Implements

- [`AuthSession`](../interfaces/AuthSession.md)

## Constructors

### Constructor

> **new DefaultAuthSession**(): `DefaultAuthSession`

#### Returns

`DefaultAuthSession`

## Accessors

### isAuthenticated

#### Get Signature

> **get** **isAuthenticated**(): `boolean`

##### Returns

`boolean`

#### Implementation of

[`AuthSession`](../interfaces/AuthSession.md).[`isAuthenticated`](../interfaces/AuthSession.md#isauthenticated)

***

### principal

#### Get Signature

> **get** **principal**(): [`Principal`](../interfaces/Principal.md) \| `null`

##### Returns

[`Principal`](../interfaces/Principal.md) \| `null`

#### Implementation of

[`AuthSession`](../interfaces/AuthSession.md).[`principal`](../interfaces/AuthSession.md#principal)

***

### token

#### Get Signature

> **get** **token**(): `string` \| `null`

##### Returns

`string` \| `null`

#### Implementation of

[`AuthSession`](../interfaces/AuthSession.md).[`token`](../interfaces/AuthSession.md#token)

## Methods

### clear()

> **clear**(): `void`

Clears the session, resetting to an unauthenticated state.

#### Returns

`void`

#### Implementation of

[`AuthSession`](../interfaces/AuthSession.md).[`clear`](../interfaces/AuthSession.md#clear)

***

### setPrincipal()

> **setPrincipal**(`principal`, `token`): `void`

Sets the principal and token, marking the session as authenticated.

#### Parameters

##### principal

[`Principal`](../interfaces/Principal.md)

The authenticated principal.

##### token

`string`

The session or access token.

#### Returns

`void`

#### Implementation of

[`AuthSession`](../interfaces/AuthSession.md).[`setPrincipal`](../interfaces/AuthSession.md#setprincipal)
