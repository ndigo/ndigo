[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / DISPATCH\_ERROR\_ATTRIBUTE

# Variable: DISPATCH\_ERROR\_ATTRIBUTE

> `const` **DISPATCH\_ERROR\_ATTRIBUTE**: `"__dispatch:error"` = `'__dispatch:error'`

Route attribute key under which the dispatcher records a dispatch/render
failure that it swallowed (DSV-B1).

The dispatcher must not reject `dispatch()` — browser callers invoke
`void dispatcher.dispatch(route)` — so a handler-adapter, view-resolution,
or render failure that remains after `completeHandle` interceptors have run
is written to `route.attributes[DISPATCH_ERROR_ATTRIBUTE]` instead. A
platform adapter that owns an HTTP response reads it back with
[getDispatchError](../functions/getDispatchError.md) to finalize a deterministic error response rather
than leaving the request open. The value is the `Error` that remained
unhandled; the attribute is absent when dispatch completed cleanly (or when
a resolved error view / streaming view already produced a response).
