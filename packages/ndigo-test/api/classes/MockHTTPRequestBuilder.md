[**@ndigo/test v0.0.1**](../README.md)

***

[@ndigo/test](../README.md) / MockHTTPRequestBuilder

# Class: MockHTTPRequestBuilder

Fluent builder for a single mock HTTP request.

```ts
const res = await mockHTTP.get('/todos').query({ filter: 'active' }).exec();
expect(res.json()).toEqual([...]);
```

## Constructors

### Constructor

> **new MockHTTPRequestBuilder**(`mockHTTP`, `request`): `MockHTTPRequestBuilder`

#### Parameters

##### mockHTTP

[`MockHTTP`](MockHTTP.md)

The owning MockHTTP.

##### request

[`MockRequest`](../interfaces/MockRequest.md)

The base request spec.

#### Returns

`MockHTTPRequestBuilder`

## Methods

### abort()

> **abort**(): `this`

Simulate a client abort before the request completes — the live
adapter's `400` `request_aborted` problem (HTT-REV-014).

#### Returns

`this`

This builder.

***

### body()

> **body**(`body`): `this`

Set the request body.

#### Parameters

##### body

`Record`\<`string`, `unknown`\>

JSON object body.

#### Returns

`this`

This builder.

***

### cookies()

> **cookies**(`cookies`): `this`

Set cookies.

#### Parameters

##### cookies

`Record`\<`string`, `string`\>

Cookie map.

#### Returns

`this`

This builder.

***

### exec()

> **exec**(): `Promise`\<[`MockResult`](#)\>

Dispatch the request through the pipeline.

#### Returns

`Promise`\<[`MockResult`](#)\>

The mock result (status, headers, parsed body).

***

### headers()

> **headers**(`headers`): `this`

Set request headers.

#### Parameters

##### headers

`Record`\<`string`, `string`\>

Header map (lower-cased keys).

#### Returns

`this`

This builder.

***

### query()

> **query**(`query`): `this`

Add query parameters. Supplying a key again (or an array value)
accumulates: the value is promoted to an array on repeats, matching the
live adapter's `?a=1&a=2` multi-value contract.

#### Parameters

##### query

`Record`\<`string`, `string` \| `string`[]\>

Query parameter map.

#### Returns

`this`

This builder.

***

### rawBody()

> **rawBody**(`body`): `this`

Set a raw (unserialized) request body, sent verbatim with the given
Content-Type. Used for content types the JSON `.body()` cannot express,
most notably `multipart/form-data`: when the Content-Type is multipart the
bytes are streamed through the real busboy parser before dispatch.

#### Parameters

##### body

`string` \| `Buffer`\<`ArrayBufferLike`\>

Raw body string or Buffer.

#### Returns

`this`

This builder.

***

### remoteAddress()

> **remoteAddress**(`remoteAddress`): `this`

Set the client socket address (the rate limiter's key; SEC-6).

#### Parameters

##### remoteAddress

`string`

#### Returns

`this`

***

### session()

> **session**(`session`): `this`

Set session data.

#### Parameters

##### session

`Record`\<`string`, `unknown`\>

Session map.

#### Returns

`this`

This builder.

***

### timeout()

> **timeout**(): `this`

Simulate a request-body timeout — the live adapter's `408`
`request_timeout` problem (HTT-REV-014).

#### Returns

`this`

This builder.
