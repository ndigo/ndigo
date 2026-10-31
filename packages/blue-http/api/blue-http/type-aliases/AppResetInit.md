[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / AppResetInit

# Type Alias: AppResetInit

> **AppResetInit** = [`HTTPInit`](HTTPInit.md) & `object`

Extends HTTP initialization with app-reset response handling options.

## Type Declaration

### appResetCode?

> `optional` **appResetCode?**: `number`

The status code that triggers an app reset.

#### Default

```ts
205
```

### appResetHeader?

> `optional` **appResetHeader?**: `string`

The header name to check for an app reset signal.

#### Default

```ts
'Alt-Location'
```
