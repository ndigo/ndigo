[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / HealthController

# Class: HealthController

Defined in: [packages/blue-management/src/health-controller.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health-controller.ts#lines-25)

Serves application health under `/health`.

Runs the context-level [HealthRegistry](HealthRegistry.md) (all registered indicators),
plus a [TelemetryHealthIndicator](TelemetryHealthIndicator.md) built at request time from the
context aggregator — so `/health` always reflects the telemetry pipeline,
even when the registry was wired without it.

## Since

1.0.0

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Constructors

### Constructor

> **new HealthController**(): `HealthController`

#### Returns

`HealthController`

#### Inherited from

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

Defined in: [packages/blue-management/src/health-controller.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health-controller.ts#lines-26)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/lib/context.d.ts:145

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

### health()

> **health**(): `Promise`\<[`HealthStatus`](../interfaces/HealthStatus.md) \| \{ `status`: `string`; `components`: \{ \}; `timestamp`: `string`; \}\>

Defined in: [packages/blue-management/src/health-controller.ts:35](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health-controller.ts#lines-35)

Returns the aggregate health status.

#### Returns

`Promise`\<[`HealthStatus`](../interfaces/HealthStatus.md) \| \{ `status`: `string`; `components`: \{ \}; `timestamp`: `string`; \}\>

`{ status, components, timestamp }`, or `{ status: 'UNKNOWN' }`
  when no registry is wired.
