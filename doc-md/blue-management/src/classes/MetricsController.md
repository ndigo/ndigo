[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / MetricsController

# Class: MetricsController

Defined in: [packages/blue-management/src/metrics-controller.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/metrics-controller.ts#lines-21)

Serves aggregated application metrics under `/metrics`.

Reads the context-level [FeatureMetricAggregator](#) (populated by the
`counted` decorator and feature code) and serializes per-feature counters,
gauges, and durations as JSON — the Blue-native pull view over telemetry.

## Since

1.0.0

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

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

Defined in: [packages/blue-management/src/metrics-controller.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/metrics-controller.ts#lines-22)

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

### metrics()

> **metrics**(): \{ `error`: `string`; `features?`: `undefined`; \} \| \{ `error?`: `undefined`; `features`: `Record`\<`string`, \{ `counters`: `Record`\<`string`, `number`\>; `gauges`: `Record`\<`string`, `number`\>; `updatedAt`: `string`; \}\>; \}

Defined in: [packages/blue-management/src/metrics-controller.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/metrics-controller.ts#lines-31)

Returns the full metrics snapshot.

#### Returns

\{ `error`: `string`; `features?`: `undefined`; \} \| \{ `error?`: `undefined`; `features`: `Record`\<`string`, \{ `counters`: `Record`\<`string`, `number`\>; `gauges`: `Record`\<`string`, `number`\>; `updatedAt`: `string`; \}\>; \}

`{ features: { <feature>: { counters, gauges, updatedAt } } }`,
  or `{ error }` when no aggregator is wired.
