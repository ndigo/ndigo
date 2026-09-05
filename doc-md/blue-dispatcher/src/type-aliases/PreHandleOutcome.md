[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / PreHandleOutcome

# Type Alias: PreHandleOutcome

> **PreHandleOutcome** = `boolean` \| [`InterceptorDenial`](../interfaces/InterceptorDenial.md)

Defined in: [packages/blue-dispatcher/src/route-handler-interceptor.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-interceptor.ts#lines-15)

The outcome of a `preHandle` invocation: `true` allows the request,
`false` is the default denial, and an explicit [InterceptorDenial](../interfaces/InterceptorDenial.md)
carries the finalized status/body/redirect for the platform adapter.
