[**@ndigo/resilience v0.0.1**](../../README.md)

***

[@ndigo/resilience](../../README.md) / [circuit-breaker](../README.md) / CircuitBreakerSpec

# Interface: CircuitBreakerSpec

Circuit-breaking policy for one method (AD-43 D-5): after
`failureThreshold` consecutive failures the circuit opens and calls fail
fast; once `resetMs` has elapsed a single probe attempt runs the call —
success closes the circuit, failure re-opens it with a fresh window.

## Properties

### failureThreshold?

> `optional` **failureThreshold?**: `number`

Consecutive failures that open the circuit. Defaults to `5`. Must be
a positive integer — invalid values fail loudly at weave time.

***

### resetMs?

> `optional` **resetMs?**: `number`

Milliseconds the circuit stays open before the next call becomes a
probe. Defaults to `10_000`. Must be a positive finite number —
invalid values fail loudly at weave time.
