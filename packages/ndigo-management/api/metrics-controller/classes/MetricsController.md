[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [metrics-controller](../README.md) / MetricsController

# Class: MetricsController

Serves the meter snapshot under `/metrics` (AD-77 D-4): one source of
truth — the process's registered `MetricSnapshotProvider` — in two wire
forms. An `Accept: application/json` (or `*+json`) header selects the
JSON projection; every other request receives the Prometheus text
exposition document with `Content-Type: text/plain; version=0.0.4`.
When no snapshot source is registered (no telemetry configured), the
endpoint answers the classic error document.

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Constructors

### Constructor

> **new MetricsController**(): `MetricsController`

#### Returns

`MetricsController`

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

The application context injected by the aware mixin.

## Methods

### metrics()

> **metrics**(`accept?`): `Promise`\<`MetricJSONView` \| `ResponseEntity`\<`string`\> \| \{ `error`: `string`; \}\>

Returns the metric snapshot in the negotiated wire form.

#### Parameters

##### accept?

`string`

The `Accept` header value (absent for socket/bare calls).

#### Returns

`Promise`\<`MetricJSONView` \| `ResponseEntity`\<`string`\> \| \{ `error`: `string`; \}\>

The Prometheus text document, the JSON projection, or the
  no-source error document.

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
