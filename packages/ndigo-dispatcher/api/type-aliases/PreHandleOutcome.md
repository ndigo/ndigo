[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / PreHandleOutcome

# Type Alias: PreHandleOutcome

> **PreHandleOutcome** = `boolean` \| [`InterceptorDenial`](../interfaces/InterceptorDenial.md)

The outcome of a `preHandle` invocation: `true` allows the request,
`false` is the default denial, and an explicit [InterceptorDenial](../interfaces/InterceptorDenial.md)
carries the finalized status/body/redirect for the platform adapter.
