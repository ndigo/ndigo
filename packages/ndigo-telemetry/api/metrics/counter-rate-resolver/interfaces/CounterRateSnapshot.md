[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/counter-rate-resolver](../README.md) / CounterRateSnapshot

# Interface: CounterRateSnapshot

Represents a snapshot of a counter's rate per second for a specific feature.

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
