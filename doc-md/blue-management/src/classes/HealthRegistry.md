[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / HealthRegistry

# Class: HealthRegistry

Defined in: [packages/blue-management/src/health.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-48)

Collects [HealthIndicator](../interfaces/HealthIndicator.md) results into a single aggregate status.

The aggregate is `UP` when every indicator is `UP`; `DOWN` when any is
`DOWN` (or a check throws); otherwise `UNKNOWN`.

## Constructors

### Constructor

> **new HealthRegistry**(): `HealthRegistry`

#### Returns

`HealthRegistry`

## Accessors

### names

#### Get Signature

> **get** **names**(): readonly `string`[]

Defined in: [packages/blue-management/src/health.ts:75](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-75)

The names of all registered indicators.

##### Returns

readonly `string`[]

## Methods

### register()

> **register**(`indicator`): `this`

Defined in: [packages/blue-management/src/health.ts:57](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-57)

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

Defined in: [packages/blue-management/src/health.ts:68](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-68)

Removes an indicator by name.

#### Parameters

##### name

`string`

The indicator name.

#### Returns

`boolean`

`true` when an indicator was removed.

***

### checkAll()

> **checkAll**(): `Promise`\<[`HealthStatus`](../interfaces/HealthStatus.md)\>

Defined in: [packages/blue-management/src/health.ts:84](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-84)

Runs every indicator and aggregates the results.

#### Returns

`Promise`\<[`HealthStatus`](../interfaces/HealthStatus.md)\>

The aggregate health status with per-indicator details.
