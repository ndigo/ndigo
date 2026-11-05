[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/trace-header-interceptor](../README.md) / TraceHeaderInterceptorOptions

# Interface: TraceHeaderInterceptorOptions

Options for the [TraceHeaderInterceptor](../classes/TraceHeaderInterceptor.md).

## Properties

### getContext?

> `optional` **getContext?**: () => `Context`

Explicit context provider for the trace header.

Browsers have no async-local storage — the ambient active context is
lost across `await` boundaries. Provide a closure over the span you
started for the request so `traceparent` is still injected (the
browser→server journey pattern). Defaults to the ambient active
context (works under Node's async-local context).

#### Returns

`Context`
