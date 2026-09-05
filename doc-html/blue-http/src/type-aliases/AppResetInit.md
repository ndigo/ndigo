[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / AppResetInit

# Type Alias: AppResetInit

> **AppResetInit** = [`HTTPInit`](HTTPInit.md) & `object`

Defined in: [packages/blue-http/src/interceptors/app-reset-interceptor.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/app-reset-interceptor.ts#lines-10)

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
