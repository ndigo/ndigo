[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / errorMapping

# Variable: errorMapping

> `const` **errorMapping**: (`errorClass`) => (`target`, `context`) => `void` & `object`

Defined in: packages/blue-dispatcher/src/error-mapping.ts:114

Export errorMapping with utility methods

## Type Declaration

### get

> **get**: (`target`, `propertyKey`) => `Constructable`\<`Error`\>[] = `getErrorMapping`

Get error mapping for a method

#### Parameters

##### target

`any`

##### propertyKey

`string` \| `symbol`

#### Returns

`Constructable`\<`Error`\>[]

### has

> **has**: (`target`, `propertyKey`) => `boolean` = `hasErrorMapping`

Check if method has error mapping

#### Parameters

##### target

`any`

##### propertyKey

`string` \| `symbol`

#### Returns

`boolean`
