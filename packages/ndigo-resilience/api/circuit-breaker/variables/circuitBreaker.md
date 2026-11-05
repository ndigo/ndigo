[**@ndigo/resilience v0.0.1**](../../README.md)

***

[@ndigo/resilience](../../README.md) / [circuit-breaker](../README.md) / circuitBreaker

# Variable: circuitBreaker

> `const` **circuitBreaker**: `AnnotationKey`\<[`CircuitBreakerSpec`](../interfaces/CircuitBreakerSpec.md)\>

`@circuitBreaker` annotation key: methods carrying a
[CircuitBreakerSpec](../interfaces/CircuitBreakerSpec.md) are protected by a registered
[CircuitBreakerInterceptor](../classes/CircuitBreakerInterceptor.md).

The advice is async: through a woven proxy a `@circuitBreaker`-advised
**sync** method returns a Promise even though its declared type is not
(the annotation is invisible to the type system). Prefer advising
Promise-returning methods.
