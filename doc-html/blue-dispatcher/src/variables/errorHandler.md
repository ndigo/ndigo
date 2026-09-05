[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / errorHandler

# Variable: errorHandler

> `const` **errorHandler**: (`target`, `context`) => `any` & `object`

Defined in: [packages/blue-dispatcher/src/error-mapping.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error-mapping.ts#lines-89)

`errorHandler` is a decorator and a utility object for managing error handler classes.
When used as a decorator (the `errorHandler` decorator), it marks a class as an error handler.
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
Invoked via the `errorHandler` decorator.
  // ...
}

const isHandler = errorHandler.has(MyErrorHandler);
```
