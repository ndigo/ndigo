[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / isFunction

# Variable: isFunction()

> `const` **isFunction**: (`value`) => `value is Function`

Defined in: packages/blue-util/src/type/is-function.ts:23

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
