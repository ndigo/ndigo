[**@blue/test v0.0.1**](../README.md)

***

[@blue/test](../README.md) / MockHTTP

# Class: MockHTTP

A socket-free mock MVC client for testing Blue server-side applications.

Wraps a configured [NodeDispatcher](#) and dispatches mock requests
through it, capturing the resulting HTTP response in memory.

## Example

```ts
const boot = await bootApp([MyConfiguration]);
const mockHTTP = new MockHTTP(boot.dispatcher);
const res = await mockHTTP.get('/todos').exec();
```

## Constructors

### Constructor

> **new MockHTTP**(`arg`, `options?`): `MockHTTP`

#### Parameters

##### arg

[`NodeDispatcher`](#) \| \{ `dispatcher`: [`NodeDispatcher`](#); \}

(application dispatcher) - A configured node dispatcher, or an app with one.

##### options?

Optional harness configuration. `multipartLimits` is
passed through to the multipart parser, mirroring
`NodeHTTPServerAdapterOptions.multipart`.

###### multipartLimits?

`Partial`\<`MultipartLimits`\>

#### Returns

`MockHTTP`

## Accessors

### dispatcher

#### Get Signature

> **get** **dispatcher**(): [`NodeDispatcher`](#)

The configured dispatcher.

##### Returns

[`NodeDispatcher`](#)

## Methods

### delete()

> **delete**(`path`): [`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

DELETE request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

***

### get()

> **get**(`path`): [`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

GET request builder.

#### Parameters

##### path

`string`

The path, e.g. `/todos`.

#### Returns

[`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

***

### patch()

> **patch**(`path`): [`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

PATCH request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

***

### post()

> **post**(`path`): [`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

POST request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

***

### put()

> **put**(`path`): [`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

PUT request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

***

### query()

> **query**(`path`): [`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

QUERY (RFC 9889) request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockHTTPRequestBuilder`](MockHTTPRequestBuilder.md)

***

### request()

> **request**(`req`): `Promise`\<[`MockResult`](#)\>

Dispatch an arbitrary mock request.

Replicates `NodeHTTPServerAdapter`'s request→dispatch contract so the
in-process behavior matches a real HTTP hit: an unmatched route yields
`404` JSON; a path whose handlers reject the method yields `405` with an
`Allow` header; a socket-only endpoint (`@socketMapping`) yields `404`;
an unmatched `OPTIONS` dispatches so interceptor-only concerns (CORS
preflight) can finalize, defaulting to `404` when none does; a
dispatcher error yields `500` JSON; an interceptor denial yields the
adapter's deterministic denial response (`401`/`403` problem document,
redirect `302` with `Location`, or an empty `<= 399` status).

#### Parameters

##### req

[`MockRequest`](../interfaces/MockRequest.md)

The request spec.

#### Returns

`Promise`\<[`MockResult`](#)\>

The mock result.
