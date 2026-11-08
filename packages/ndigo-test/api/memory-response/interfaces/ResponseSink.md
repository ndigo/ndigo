[**@ndigo/test v0.0.1**](../../README.md)

***

[@ndigo/test](../../README.md) / [memory-response](../README.md) / ResponseSink

# Interface: ResponseSink

The `ServerResponse`-shaped sink the pipeline writes to: the members
`HTTPResponseViewTarget` / `ResponseEntityView` and server interceptors
(CORS, CSRF, security headers) touch — `writeHead` merges with headers set
earlier via [ResponseSink.setHeader](#setheader), mirroring Node's semantics.

## Properties

### headersSent

> `readonly` **headersSent**: `boolean`

Whether the response head has been written.

## Methods

### destroy()

> **destroy**(): `void`

Abort the response (stream failure after headers were sent).

#### Returns

`void`

***

### end()

> **end**(`body?`): `void`

Finalize the response with the given body.

#### Parameters

##### body?

`unknown`

The final body to record.

#### Returns

`void`

***

### getHeader()

> **getHeader**(`name`): `string` \| `string`[] \| `undefined`

Read a previously set header (case-insensitive), mirroring `ServerResponse`.

#### Parameters

##### name

`string`

The header name.

#### Returns

`string` \| `string`[] \| `undefined`

The header value, or `undefined` when it was never set.

***

### removeHeader()

> **removeHeader**(`name`): `void`

Remove a header previously set (lower-cased key; no-op when absent).

#### Parameters

##### name

`string`

The header name to remove.

#### Returns

`void`

***

### setHeader()

> **setHeader**(`name`, `value`): `void`

Record a single header (lower-cased key), merging with prior sets.

#### Parameters

##### name

`string`

The header name (stored lower-cased).

##### value

`string` \| `string`[]

The header value.

#### Returns

`void`

***

### write()

> **write**(`chunk`): `boolean`

Stream a body chunk into `response.body` (concatenated, in order).
Returns `true` — an in-memory sink never backpressures.

#### Parameters

##### chunk

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

The body chunk to append.

#### Returns

`boolean`

Always `true`.

***

### writeHead()

> **writeHead**(`status`, `headers?`): `void`

Record the status and headers, merging with prior sets.

#### Parameters

##### status

`number`

The HTTP status code.

##### headers?

`Record`\<`string`, `string` \| `string`[]\>

Headers to merge into the response.

#### Returns

`void`
