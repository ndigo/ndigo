[**@ndigo/resilience v0.0.1**](../README.md)

***

[@ndigo/resilience](../README.md) / CircuitBreakerInterceptorOptions

# Interface: CircuitBreakerInterceptorOptions

Options for [CircuitBreakerInterceptor](../classes/CircuitBreakerInterceptor.md).

## Properties

### now?

> `optional` **now?**: () => `number`

Time source; defaults to `Date.now`. Inject to drive reset windows
deterministically in tests.

#### Returns

`number`
