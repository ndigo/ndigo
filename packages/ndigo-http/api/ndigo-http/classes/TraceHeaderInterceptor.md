[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / TraceHeaderInterceptor

# Class: TraceHeaderInterceptor

HTTP interceptor that injects W3C `traceparent`/`tracestate` headers from
the active trace context — the client half of distributed tracing.

With a server-side `HTTPServerInstrumentation` on the receiving end, the
inbound server span continues the same trace: `traceId` matches and the
server span's parent is the client's span.

## Example

```ts
const span = trace.getTracer('app').startSpan('client.fetch');
const http = HTTP.create({
    interceptors: [new TraceHeaderInterceptor({ getContext: () => trace.setSpan(otelContext.ROOT, span) })],
});
await http.get('/data.json');
span.end();
```

## Implements

- [`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new TraceHeaderInterceptor**(`options?`): `TraceHeaderInterceptor`

Creates the interceptor.

#### Parameters

##### options?

[`TraceHeaderInterceptorOptions`](../interfaces/TraceHeaderInterceptorOptions.md) = `{}`

Optional explicit context provider.

#### Returns

`TraceHeaderInterceptor`

## Methods

### preRequest()

> **preRequest**(`request`, `_http`): `Promise`\<`void`\>

Injects the trace headers into the outgoing request when a span is
active; leaves the request untouched otherwise.

#### Parameters

##### request

`Request`

The outgoing request.

##### \_http

[`HTTP`](HTTP.md)

The HTTP client executing the request.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md).[`preRequest`](../interfaces/RequestAwareHTTPInterceptor.md#prerequest)
