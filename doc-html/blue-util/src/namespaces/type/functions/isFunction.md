[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [type](../README.md) / isFunction

# Function: isFunction()

> **isFunction**(`value`): `value is Function`

Defined in: [packages/blue-util/src/type/is-function.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/type/is-function.ts#lines-21)

Determines whether a given object is a function.

## Parameters

### value

`any`

The value to be tested.

## Returns

`value is Function`

Whether or not `value` is a function.

## Example

```ts
isFunction( new Function() );
//=> true
isFunction( () => void 0 );
//=> true
isFunction( function(){} );
//=> true
isFunction( {} );
//=> false
```
