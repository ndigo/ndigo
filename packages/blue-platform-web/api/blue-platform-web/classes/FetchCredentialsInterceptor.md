[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / FetchCredentialsInterceptor

# Class: FetchCredentialsInterceptor

HTTP interceptor that sets the fetch `credentials` mode for cross-origin
(CORS) requests. This is a browser-side helper ONLY — Fetch already
enforces CORS; the interceptor just controls whether credentials travel
with the request.

## Example

```ts
const http = new HTTP([new FetchCredentialsInterceptor({ credentials: 'include' })]);
await http.get('https://api.example.com/data');
```

## Implements

- [`RequestAwareHTTPInterceptor`](#)

## Constructors

### Constructor

> **new FetchCredentialsInterceptor**(`config?`): `FetchCredentialsInterceptor`

#### Parameters

##### config?

[`FetchCredentialsInterceptorConfig`](../interfaces/FetchCredentialsInterceptorConfig.md) = `{}`

#### Returns

`FetchCredentialsInterceptor`

## Methods

### preRequest()

> **preRequest**(`request`, `_http`): `Promise`\<`void` \| `Request`\>

Applies the configured credentials mode to the outgoing request.

Clones the request so method, headers, body, signal, mode, redirect,
cache, integrity and keepalive are preserved, overriding only `credentials`.

#### Parameters

##### request

`Request`

The outgoing request.

##### \_http

`HTTP`

#### Returns

`Promise`\<`void` \| `Request`\>

A clone of the request carrying the credentials mode.

#### Implementation of

`RequestAwareHTTPInterceptor.preRequest`
