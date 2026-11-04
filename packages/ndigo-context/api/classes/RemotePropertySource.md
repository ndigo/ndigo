[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / RemotePropertySource

# Class: RemotePropertySource

A named remote property source: fetches a JSON document, merges changes
into the environment, and (optionally) polls with ETag/body-text gating.

## Constructors

### Constructor

> **new RemotePropertySource**(`environment`, `options`): `RemotePropertySource`

Creates a remote property source.

#### Parameters

##### environment

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

The environment the source fetches into.

##### options

[`RemoteSourceOptions`](../interfaces/RemoteSourceOptions.md)

The source configuration.

#### Returns

`RemotePropertySource`

#### Throws

When the URL is missing, or — with the
default fetch (no injected seam) — when the URL scheme is not `https:`.

## Accessors

### name

#### Get Signature

> **get** **name**(): `string`

The name this source is registered under.

##### Returns

`string`

***

### started

#### Get Signature

> **get** **started**(): `boolean`

Whether the source is currently polling.

##### Returns

`boolean`

## Methods

### load()

> **load**(): `Promise`\<`boolean`\>

Fetches the remote document once and merges it into the environment at
the documented precedence slot (`configServer` between
`systemEnvironment` and `application`/`dotenv` — anchored so the
position is correct regardless of which platform sources exist).

The source is registered at load time; a later poll only `replace`s
its own entry (position preserved, version bumped).

#### Returns

`Promise`\<`boolean`\>

`true` when a document was applied, `false` when skipped
(optional failure).

#### Throws

When `optional: false` and the fetch fails,
or the response is not a JSON object.

***

### start()

> **start**(): `void`

Starts polling. Idempotent — a second call is a no-op on an already
started source.

#### Returns

`void`

#### Throws

When `pollMs` is 0 (nothing to poll).

***

### stop()

> **stop**(): `void`

Stops polling and clears the pending interval. Idempotent.

#### Returns

`void`
