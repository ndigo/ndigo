[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / FetchCredentialsInterceptorConfig

# Interface: FetchCredentialsInterceptorConfig

Defined in: [packages/blue-platform-web/src/fetch-credentials.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/fetch-credentials.ts#lines-15)

Configuration for the [FetchCredentialsInterceptor](../classes/FetchCredentialsInterceptor.md).

This is a CLIENT-side fetch helper: it adjusts `credentials`/`mode` on the
outgoing request so the browser performs the cross-origin handshake. It is
NOT a server-side CORS boundary — the server must attach the allow headers
(see `@blue/platform-node` `CORSInterceptor`).

## Properties

### credentials?

> `optional` **credentials?**: `RequestCredentials`

Defined in: [packages/blue-platform-web/src/fetch-credentials.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/fetch-credentials.ts#lines-22)

Fetch credentials mode for cross-origin requests: `'include'` sends
cookies/authentication on cross-origin requests (requires the server's
`Access-Control-Allow-Credentials`), `'omit'` suppresses them.

#### Default Value

`'omit'` — the fetch default; safe for public APIs.
