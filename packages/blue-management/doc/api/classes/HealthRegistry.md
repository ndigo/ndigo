[**@blue/management v0.0.1**](../README.md)

***

[@blue/management](../README.md) / HealthRegistry

# Class: HealthRegistry

Collects [HealthIndicator](../interfaces/HealthIndicator.md) results into a single aggregate status.

The aggregate is `UP` when every indicator is `UP`; `DOWN` when any is
`DOWN` (or a check throws); otherwise `UNKNOWN`.

## Constructors

### Constructor

> **new HealthRegistry**(`options?`): `HealthRegistry`

#### Parameters

##### options?

[`HealthRegistryOptions`](../interfaces/HealthRegistryOptions.md) = `{}`

Registry options (e.g. error redaction).

#### Returns

`HealthRegistry`

## Accessors

### names

#### Get Signature

> **get** **names**(): readonly `string`[]

The names of all registered indicators.

##### Returns

readonly `string`[]

## Methods

### checkAll()

> **checkAll**(): `Promise`\<[`HealthStatus`](../interfaces/HealthStatus.md)\>

Runs every indicator and aggregates the results.

#### Returns

`Promise`\<[`HealthStatus`](../interfaces/HealthStatus.md)\>

The aggregate health status with per-indicator details.

***

### register()

> **register**(`indicator`): `this`

Registers (or replaces) an indicator by name.

#### Parameters

##### indicator

[`HealthIndicator`](../interfaces/HealthIndicator.md)

The indicator to register.

#### Returns

`this`

This registry.

***

### unregister()

> **unregister**(`name`): `boolean`

Removes an indicator by name.

#### Parameters

##### name

`string`

The indicator name.

#### Returns

`boolean`

`true` when an indicator was removed.
