[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [security-headers-interceptor](../README.md) / SecurityHeadersInterceptorOptions

# Interface: SecurityHeadersInterceptorOptions

Configuration for the security-headers interceptor.

`headers` mirrors Helmet's option surface: each key accepts `false` to
disable that header, `true`/omitted for the framework default, or the
header's own option object. Construction validates (malformed options
throw a TypeError — Helmet's behavior, moved to bean startup).

## Properties

### enabled?

> `optional` **enabled?**: `boolean`

Master switch: `false` sends no security headers at all.
Default: `true`.

***

### headers?

> `optional` **headers?**: `HelmetOptions`

Per-header configuration (see the interface doc). Omitted = the full
framework default set (AD-25 D3).
