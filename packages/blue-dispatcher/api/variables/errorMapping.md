[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / errorMapping

# Variable: errorMapping

> `const` **errorMapping**: ((`errorClass`) => (`target`, `context`) => `void`) & `object`

Export errorMapping with utility methods

## Type Declaration

### get

> **get**: (`target`, `propertyKey`) => `Constructable`\<`Error`\>[] = `getErrorMapping`

Get error mapping for a method

#### Parameters

##### target

`unknown`

##### propertyKey

`string` \| `symbol`

#### Returns

`Constructable`\<`Error`\>[]

### has

> **has**: (`target`, `propertyKey`) => `boolean` = `hasErrorMapping`

Check if method has error mapping

#### Parameters

##### target

`unknown`

##### propertyKey

`string` \| `symbol`

#### Returns

`boolean`
