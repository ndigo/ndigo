[**@blue/management v0.0.1**](../README.md)

***

[@blue/management](../README.md) / HealthController

# Class: HealthController

Serves application health under `/health`.

Runs the context-level [HealthRegistry](HealthRegistry.md) (all registered indicators —
including the telemetry indicator wired at context refresh by
[ManagementAutoConfiguration](ManagementAutoConfiguration.md)). The registry is read-only here;
it is never mutated per request.

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

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

## Methods

### health()

> **health**(): `Promise`\<[`HealthStatus`](../interfaces/HealthStatus.md) \| \{ `components`: \{ \}; `status`: `string`; `timestamp`: `string`; \}\>

Returns the aggregate health status.

#### Returns

`Promise`\<[`HealthStatus`](../interfaces/HealthStatus.md) \| \{ `components`: \{ \}; `status`: `string`; `timestamp`: `string`; \}\>

`{ status, components, timestamp }`, or `{ status: 'UNKNOWN' }`
  when no registry is wired.

***

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
