[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / AppResetInit

# Type Alias: AppResetInit

> **AppResetInit** = `HTTPInit` & `object`

Defined in: packages/blue-http/lib/interceptors/app-reset-interceptor.d.ts:8

Extends HTTP initialization with app-reset response handling options.

## Type Declaration

### appResetHeader?

> `optional` **appResetHeader?**: `string`

The header name to check for an app reset signal.

#### Default

```ts
'Alt-Location'
```

### appResetCode?

> `optional` **appResetCode?**: `number`

The status code that triggers an app reset.

#### Default

```ts
205
```
