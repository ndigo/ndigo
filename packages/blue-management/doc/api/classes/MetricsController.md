[**@blue/management v0.0.1**](../README.md)

***

[@blue/management](../README.md) / MetricsController

# Class: MetricsController

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

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

## Methods

### metrics()

> **metrics**(): \{ `error`: `string`; `features?`: `undefined`; \} \| \{ `error?`: `undefined`; `features`: `Record`\<`string`, \{ `counters`: `Record`\<`string`, `number`\>; `durations`: `Record`\<`string`, `DurationSummary`\>; `gauges`: `Record`\<`string`, `number`\>; `updatedAt`: `string`; \}\>; \}

Returns the full metrics snapshot.

#### Returns

\{ `error`: `string`; `features?`: `undefined`; \} \| \{ `error?`: `undefined`; `features`: `Record`\<`string`, \{ `counters`: `Record`\<`string`, `number`\>; `durations`: `Record`\<`string`, `DurationSummary`\>; `gauges`: `Record`\<`string`, `number`\>; `updatedAt`: `string`; \}\>; \}

`{ features: { <feature>: { counters, gauges, durations, updatedAt } } }`,
  or `{ error }` when no aggregator is wired.

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
