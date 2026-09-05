[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / FetchCredentialsInterceptor

# Class: FetchCredentialsInterceptor

Defined in: [packages/blue-platform-web/src/fetch-credentials.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/fetch-credentials.ts#lines-37)

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

- `RequestAwareHTTPInterceptor`

## Constructors

### Constructor

> **new FetchCredentialsInterceptor**(`config?`): `FetchCredentialsInterceptor`

Defined in: [packages/blue-platform-web/src/fetch-credentials.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/fetch-credentials.ts#lines-40)

#### Parameters

##### config?

[`FetchCredentialsInterceptorConfig`](../interfaces/FetchCredentialsInterceptorConfig.md) = `{}`

#### Returns

`FetchCredentialsInterceptor`

## Methods

### preRequest()

> **preRequest**(`request`, `_http`): `Promise`\<`void` \| `Request`\>

Defined in: [packages/blue-platform-web/src/fetch-credentials.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/fetch-credentials.ts#lines-50)

Applies the configured credentials mode to the outgoing request.

#### Parameters

##### request

`Request`

The outgoing request.

##### \_http

`HTTP`

#### Returns

`Promise`\<`void` \| `Request`\>

The modified request carrying the credentials mode.

#### Implementation of

`RequestAwareHTTPInterceptor.preRequest`
