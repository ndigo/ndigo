[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / AuthRegistry

# Class: AuthRegistry

Central registry for authentication adapters.

Allows the framework to support multiple authentication providers
(e.g., OIDC, SAML, JWT) by registering them at startup.

## Constructors

### Constructor

> **new AuthRegistry**(): `AuthRegistry`

#### Returns

`AuthRegistry`

## Methods

### clear()

> `static` **clear**(): `void`

Clears all registered adapters.

#### Returns

`void`

***

### getAdapter()

> `static` **getAdapter**(`id`): [`AuthAdapter`](../interfaces/AuthAdapter.md) \| `undefined`

Retrieves an adapter by its unique identifier.

#### Parameters

##### id

`string`

The adapter ID.

#### Returns

[`AuthAdapter`](../interfaces/AuthAdapter.md) \| `undefined`

The adapter, or `undefined` if not found.

***

### getAllAdapters()

> `static` **getAllAdapters**(): [`AuthAdapter`](../interfaces/AuthAdapter.md)[]

Returns all registered adapters.

#### Returns

[`AuthAdapter`](../interfaces/AuthAdapter.md)[]

***

### register()

> `static` **register**(`adapter`): `void`

Registers an authentication adapter.

#### Parameters

##### adapter

[`AuthAdapter`](../interfaces/AuthAdapter.md)

The adapter to register.

#### Returns

`void`
