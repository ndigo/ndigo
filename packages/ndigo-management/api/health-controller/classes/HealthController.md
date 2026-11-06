[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [health-controller](../README.md) / HealthController

# Class: HealthController

Serves application health under `/health`.

Runs the context-level [HealthRegistry](../../health/classes/HealthRegistry.md) (all registered indicators —
including the telemetry indicator wired at context refresh by
[ManagementAutoConfiguration](../../management-auto-configuration/classes/ManagementAutoConfiguration.md)). The registry is read-only here;
it is never mutated per request.

The HTTP status mirrors the aggregate: `503 Service Unavailable` when any
component is `DOWN`, `200 OK` otherwise (`UP` or `UNKNOWN`) — so
orchestrators (Kubernetes probes, load balancers) can route on the status
code alone, per the actuator convention.

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

### component()

> **component**(`name`): `Promise`\<`ResponseEntity`\<`void`\> \| [`HealthResponseView`](HealthResponseView.md)\>

Serves a health group or a single component under `/health/:name`
(AD-76 D-6).

A configured group (from `management.health.groups.<name>.include`)
shadows a same-named component and answers with the aggregate over
the members that are registered; a bare component answers with its
own result document. Unknown names 404; a group with no registered
members 404 too. A `DOWN` aggregate answers `503` exactly like the
root document.

#### Parameters

##### name

`string`

The group or component name.

#### Returns

`Promise`\<`ResponseEntity`\<`void`\> \| [`HealthResponseView`](HealthResponseView.md)\>

The health document at the aggregate status, or 404.

***

### health()

> **health**(): `Promise`\<[`HealthResponseView`](HealthResponseView.md)\>

Returns the aggregate health status.

#### Returns

`Promise`\<[`HealthResponseView`](HealthResponseView.md)\>

The health document at `503` when the aggregate is `DOWN`,
  `200` otherwise; `{ status: 'UNKNOWN' }` at `200` when no registry
  is wired.

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
