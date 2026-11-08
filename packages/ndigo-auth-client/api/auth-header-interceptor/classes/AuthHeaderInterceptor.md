[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [auth-header-interceptor](../README.md) / AuthHeaderInterceptor

# Class: AuthHeaderInterceptor

HTTP interceptor that injects an `Authorization: Bearer <token>` header
into outgoing requests when a valid session is available.

Integrates with `@ndigo/http`'s request pipeline. Attach it to any `HTTP`
client to automatically authenticate API calls.

## Example

```ts
const http = new HTTP([new AuthHeaderInterceptor(session)]);

// Subsequent requests include Authorization header automatically
await http.get('https://api.example.com/me');
```

## Implements

- [`RequestAwareHTTPInterceptor`](#)

## Constructors

### Constructor

> **new AuthHeaderInterceptor**(`session`): `AuthHeaderInterceptor`

Creates the interceptor over an auth session.

#### Parameters

##### session

[`AuthSession`](../../index/interfaces/AuthSession.md)

The session providing the current auth token.

#### Returns

`AuthHeaderInterceptor`

## Methods

### preRequest()

> **preRequest**(`request`, `_http`): `Promise`\<`void` \| `Request`\>

Injects the `Authorization` header before the request is sent.

#### Parameters

##### request

`Request`

The outgoing request.

##### \_http

`HTTP`

The HTTP client executing the request.

#### Returns

`Promise`\<`void` \| `Request`\>

A cloned request with the header set, or void when no token is available.

#### Implementation of

`RequestAwareHTTPInterceptor.preRequest`
