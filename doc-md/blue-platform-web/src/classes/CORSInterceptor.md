[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / CORSInterceptor

# Class: CORSInterceptor

Defined in: packages/blue-platform-web/src/cors-interceptor.ts:47

HTTP interceptor that handles CORS preflight requests automatically.

In browsers, CORS is enforced by the browser itself. This interceptor
is primarily useful for client-side code that wants to ensure the
correct request mode is set, and for server-side usage (Node.js) where
CORS headers need to be attached to responses.

## Example

```ts
const http = new HTTP([new CORSInterceptor({ withCredentials: true })]);
await http.get('https://api.example.com/data');
```

## Implements

- `RequestAwareHTTPInterceptor`

## Constructors

### Constructor

> **new CORSInterceptor**(`config?`): `CORSInterceptor`

Defined in: packages/blue-platform-web/src/cors-interceptor.ts:50

#### Parameters

##### config?

[`CORSInterceptorConfig`](../interfaces/CORSInterceptorConfig.md) = `{}`

#### Returns

`CORSInterceptor`

## Methods

### preRequest()

> **preRequest**(`request`, `_http`): `Promise`\<`void` \| `Request`\>

Defined in: packages/blue-platform-web/src/cors-interceptor.ts:61

Applies CORS settings to the outgoing request.

#### Parameters

##### request

`Request`

The outgoing request.

##### \_http

`HTTP`

The HTTP client.

#### Returns

`Promise`\<`void` \| `Request`\>

The modified request with CORS settings applied.

#### Implementation of

`RequestAwareHTTPInterceptor.preRequest`
