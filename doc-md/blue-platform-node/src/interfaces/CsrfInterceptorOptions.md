[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / CsrfInterceptorOptions

# Interface: CsrfInterceptorOptions

Defined in: packages/blue-platform-node/src/csrf-interceptor.ts:35

Options for the CSRF interceptor.

## Properties

### cookieName?

> `optional` **cookieName?**: `string`

Defined in: packages/blue-platform-node/src/csrf-interceptor.ts:37

Cookie name; defaults to `'blue-csrf'`.

***

### fieldName?

> `optional` **fieldName?**: `string`

Defined in: packages/blue-platform-node/src/csrf-interceptor.ts:39

Body/form field accepted as an alternative to the header.

***

### headerName?

> `optional` **headerName?**: `string`

Defined in: packages/blue-platform-node/src/csrf-interceptor.ts:41

Header name; defaults to `X-CSRF-Token`.

***

### cookieOptions?

> `optional` **cookieOptions?**: `string`

Defined in: packages/blue-platform-node/src/csrf-interceptor.ts:43

Cookie attributes appended to the Set-Cookie value (e.g. `'SameSite=Lax; Path=/'`).

***

### tokenBytes?

> `optional` **tokenBytes?**: `number`

Defined in: packages/blue-platform-node/src/csrf-interceptor.ts:45

Token length in bytes (default 32).
