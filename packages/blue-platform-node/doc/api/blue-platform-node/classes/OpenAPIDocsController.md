[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / OpenAPIDocsController

# Class: OpenAPIDocsController

The spec controller: self-documenting, cache-free, JSON.

The document is generated lazily on first request and memoized — the
route table is stable after context refresh, so the document cannot go
stale within a running application (a `config:refresh`-time invalidation
is a recorded follow-up).

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Constructors

### Constructor

> **new OpenAPIDocsController**(`options`): `OpenAPIDocsController`

#### Parameters

##### options

[`ResolvedOpenAPIDocsOptions`](../interfaces/ResolvedOpenAPIDocsOptions.md)

#### Returns

`OpenAPIDocsController`

#### Overrides

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AsApplicationContextAware(Null).setApplicationContext`

***

### spec()

> **spec**(`route`): `Promise`\<`void`\>

Writes the spec document with `application/json` content type.

#### Parameters

##### route

[`Route`](#)

The current route (carries the Node response).

#### Returns

`Promise`\<`void`\>
