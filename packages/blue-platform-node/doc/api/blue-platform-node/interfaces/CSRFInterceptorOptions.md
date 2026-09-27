[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / CSRFInterceptorOptions

# Interface: CSRFInterceptorOptions

Options for the CSRF interceptor.

## Properties

### cookieName?

> `optional` **cookieName?**: `string`

Cookie name; defaults to `'blue-csrf'`.

***

### cookieOptions?

> `optional` **cookieOptions?**: `string`

Cookie attributes appended to the Set-Cookie value. Defaults to `'SameSite=Lax; Secure; Path=/'`.

***

### fieldName?

> `optional` **fieldName?**: `string`

Body/form field accepted as an alternative to the header.

***

### headerName?

> `optional` **headerName?**: `string`

Header name; defaults to `X-CSRF-Token`.

***

### tokenBytes?

> `optional` **tokenBytes?**: `number`

Token length in bytes (default 32; must be an integer in 16–1024).
