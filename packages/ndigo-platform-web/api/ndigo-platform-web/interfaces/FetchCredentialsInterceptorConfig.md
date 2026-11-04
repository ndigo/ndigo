[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [ndigo-platform-web](../README.md) / FetchCredentialsInterceptorConfig

# Interface: FetchCredentialsInterceptorConfig

Configuration for the [FetchCredentialsInterceptor](../classes/FetchCredentialsInterceptor.md).

This is a CLIENT-side fetch helper: it adjusts `credentials`/`mode` on the
outgoing request so the browser performs the cross-origin handshake. It is
NOT a server-side CORS boundary — the server must attach the allow headers
(see `@ndigo/platform-node` `CORSInterceptor`).

## Properties

### credentials?

> `optional` **credentials?**: `RequestCredentials`

Fetch credentials mode for cross-origin requests: `'include'` sends
cookies/authentication on cross-origin requests (requires the server's
`Access-Control-Allow-Credentials`), `'omit'` suppresses them.

#### Default Value

`'omit'` — the interceptor default. Note that the native
`fetch` default is `'same-origin'`.
