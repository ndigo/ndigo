[**@blue/telemetry v0.0.1**](../../README.md)

***

[@blue/telemetry](../../README.md) / [blue-telemetry](../README.md) / CounterRateResolver

# Class: CounterRateResolver

Resolves and monitors the rate of change for various counters across different features.

This class samples counter values over time and calculates their rates per second.
It can also trigger alerts if a counter's rate exceeds a predefined threshold.

## Constructors

### Constructor

> **new CounterRateResolver**(`options`): `CounterRateResolver`

Creates an instance of `CounterRateResolver`.

#### Parameters

##### options

[`CounterRateResolverOptions`](../interfaces/CounterRateResolverOptions.md)

Configuration options for the resolver.

#### Returns

`CounterRateResolver`

## Methods

### clearThresholds()

> **clearThresholds**(): `void`

Clears all previously set thresholds for counter rates.

#### Returns

`void`

***

### removeThreshold()

> **removeThreshold**(`counterKey`): `boolean`

Removes a specific threshold for a given counter key.

#### Parameters

##### counterKey

`string`

The key of the counter for which to remove the threshold.

#### Returns

`boolean`

`true` if the threshold was removed, `false` otherwise.

***

### reset()

> **reset**(): `void`

Resets the internal sample history, effectively clearing all past counter data.

#### Returns

`void`

***

### resolve()

> **resolve**(): readonly [`CounterRateSnapshot`](../interfaces/CounterRateSnapshot.md)[]

Resolves the current counter rates per second for all tracked features and counters.

This method takes a new sample of counter values, updates the internal history,
and calculates the rate of change based on the configured window size.

#### Returns

readonly [`CounterRateSnapshot`](../interfaces/CounterRateSnapshot.md)[]

An array of `CounterRateSnapshot` objects, each representing the current rate
         for a specific counter and feature.

***

### resolveAlerts()

> **resolveAlerts**(`snapshots?`): readonly [`CounterRateAlert`](../interfaces/CounterRateAlert.md)[]

Resolves and returns any counter rate alerts based on the provided snapshots and configured thresholds.

#### Parameters

##### snapshots?

readonly [`CounterRateSnapshot`](../interfaces/CounterRateSnapshot.md)[] = `...`

Optional. An array of `CounterRateSnapshot` objects to evaluate. If not provided,
                   `resolve()` will be called to generate the latest snapshots.

#### Returns

readonly [`CounterRateAlert`](../interfaces/CounterRateAlert.md)[]

An array of `CounterRateAlert` objects for any counters whose rates exceed their thresholds.

***

### setThreshold()

> **setThreshold**(`counterKey`, `threshold`): `void`

Sets a threshold for a specific counter key. If the counter's rate per second
exceeds this threshold, an alert will be triggered by `resolveAlerts`.

#### Parameters

##### counterKey

`string`

The key of the counter to set the threshold for.

##### threshold

`number`

The rate per second threshold. Must be a finite number.

#### Returns

`void`

#### Throws

If the threshold is not a finite number.
