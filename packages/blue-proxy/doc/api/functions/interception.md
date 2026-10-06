[**@blue/proxy v0.0.1**](../README.md)

***

[@blue/proxy](../README.md) / interception

# Function: interception()

> **interception**(`interceptors`): [`InitializationAwareProcessor`](#)

Builds an initialization-aware entry processor advising every method an
interceptor matches, on every instance the container creates.

- Matched entries are replaced by one woven proxy (cached by the factory
  like any other singleton).
- Entries where nothing matches keep their identity.
- Re-processing an already-woven instance by *this same* processor is
  idempotent: the proxy passes through unchanged (weaving provenance
  records which processor owns the proxy).
- A *different* `interception(...)` result meeting an already-woven
  instance throws: a container may register exactly one interception
  processor, and all advice must be combined in that one call. A silent
  second registration would look configured but never run.
- An instance already woven standalone (`interceptMethods`) passes through
  with a warning: there is no duplicate registration to fail on, and the
  warning names the real cause instead of the misleading "register exactly
  one interception(...) processor" error.

Interceptor ordering is applied per entry inside [collectMethodSpecs](collectMethodSpecs.md)
(`order`, stable — missing order counts as 0), so the `order` contract
holds on the container path and the standalone path alike.

## Parameters

### interceptors

readonly [`MethodInterceptor`](../interfaces/MethodInterceptor.md)[]

The advice to apply.

## Returns

[`InitializationAwareProcessor`](#)
