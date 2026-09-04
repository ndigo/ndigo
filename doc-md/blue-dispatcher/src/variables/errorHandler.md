[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / errorHandler

# Variable: errorHandler

> `const` **errorHandler**: (`target`, `context`) => `any` & `object`

Defined in: packages/blue-dispatcher/src/error-mapping.ts:91

`errorHandler` is a decorator and a utility object for managing error handler classes.
When used as a decorator (`@errorHandler`), it marks a class as an error handler.
It also provides `get` and `has` methods to query the error handler status of a class.

## Type Declaration

### get

> **get**: (`target`) => `boolean` = `getErrorHandler`

Get error handler status

#### Parameters

##### target

`any`

#### Returns

`boolean`

### has

> **has**: (`target`) => `boolean` = `hasErrorHandler`

Check if target has error handler metadata

#### Parameters

##### target

`any`

#### Returns

`boolean`

## Example

```typescript
@errorHandler
class MyErrorHandler {
  // ...
}

const isHandler = errorHandler.has(MyErrorHandler);
```
