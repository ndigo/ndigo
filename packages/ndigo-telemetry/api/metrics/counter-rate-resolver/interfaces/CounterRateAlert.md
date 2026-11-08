[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/counter-rate-resolver](../README.md) / CounterRateAlert

# Interface: CounterRateAlert

Represents an alert triggered when a counter's rate per second exceeds a defined threshold.

## Properties

### counterKey

> `readonly` **counterKey**: `string`

The counter's map key.

***

### feature

> `readonly` **feature**: `string`

The feature the counter belongs to.

***

### ratePerSecond

> `readonly` **ratePerSecond**: `number`

The observed rate per second.

***

### threshold

> `readonly` **threshold**: `number`

The threshold that was exceeded.
