[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/app-reset-interceptor](../README.md) / AppResetInit

# Type Alias: AppResetInit

> **AppResetInit** = [`HTTPInit`](../../../http-types/type-aliases/HTTPInit.md) & `object`

Extends HTTP initialization with app-reset response handling options.

## Type Declaration

### appResetCode?

> `optional` **appResetCode?**: `number`

The status code that triggers an app reset.

#### Default Value

```ts
205
```

### appResetHeader?

> `optional` **appResetHeader?**: `string`

The header name to check for an app reset signal.

#### Default Value

```ts
'Alt-Location'
```
