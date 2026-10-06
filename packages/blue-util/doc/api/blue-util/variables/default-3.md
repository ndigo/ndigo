[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-3.md) / default

# Variable: default

> **default**: `object`

## Type Declaration

## Other

#### is

> **is**: \{\<`T`\>(`Ctor`): (`val`) => `val is T`; \<`T`\>(`Ctor`, `val`): `val is T`; \}

##### Call Signature

> \<`T`\>(`Ctor`): (`val`) => `val is T`

###### Type Parameters

###### T

`T`

###### Parameters

###### Ctor

`Function`

###### Returns

(`val`) => `val is T`

##### Call Signature

> \<`T`\>(`Ctor`, `val`): `val is T`

###### Type Parameters

###### T

`T`

###### Parameters

###### Ctor

`Function`

###### val

`unknown`

###### Returns

`val is T`

#### isNil

> **isNil**: (`x`) => x is null \| undefined

##### Parameters

###### x

`unknown`

##### Returns

x is null \| undefined

#### isNotNil

> **isNotNil**: \<`T`\>(`x`) => `x is T`

##### Type Parameters

###### T

`T`

##### Parameters

###### x

`T` \| `null` \| `undefined`

##### Returns

`x is T`

#### like

> **like**: \{(`descriptor`, `value`): `boolean`; (`descriptor`): (`value`) => `boolean`; \}

##### Call Signature

> (`descriptor`, `value`): `boolean`

###### Parameters

###### descriptor

[`LikeDescriptor`](#)

###### value

`unknown`

###### Returns

`boolean`

##### Call Signature

> (`descriptor`): (`value`) => `boolean`

###### Parameters

###### descriptor

[`LikeDescriptor`](#)

###### Returns

(`value`) => `boolean`

#### likePromise

> **likePromise**: (`value`) => `value is PromiseLike<unknown>`

##### Parameters

###### value

`unknown`

##### Returns

`value is PromiseLike<unknown>`

## Type

#### isConstructor

> **isConstructor**: (`value`) => `value is Function`

Determines whether a given value is a constructor, i.e. creates instances using `new`.

##### Parameters

###### value

`unknown`

The value to be tested.

##### Returns

`value is Function`

Whether or not `value` is a constructor.

#### isFunction

> **isFunction**: (`value`) => `value is Function`

Determines whether a given object is a function.

##### Parameters

###### value

`unknown`

The value to be tested.

##### Returns

`value is Function`

Whether or not `value` is a function.

##### Example

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

#### isNumber

> **isNumber**: (`value`) => `value is number`

Determines whether a given value is an actual finite number. The logic differs from `typeof`, which considers `NaN` and `Infinity` to be numbers and instances of `Number` to be objects.

##### Parameters

###### value

`unknown`

The value to be tested.

##### Returns

`value is number`

Whether or not `value` is a number.

##### Example

```ts
typeof new Number( 1 ) === 'number';
//=> false
isNumber( new Number( 1 ) );
//=> true
typeof 2 === 'number';
//=> true
isNumber( 2 );
//=> true
typeof NaN === 'number';
//=> true
isNumber( NaN );
//=> false
typeof Infinity === 'number';
//=> true
isNumber( Infinity );
//=> false
```

#### isNumeric

> **isNumeric**: (`value`) => `value is Numeric`

Determines whether a given value is numeric, i.e. a number or a string containing a number. The [isNumber](../functions/isNumber.md) method determines whether the value, parsed or not, is a number.

##### Parameters

###### value

`unknown`

The value to be tested.

##### Returns

`value is Numeric`

Whether or not `value` is numeric.

##### Example

```ts
isNumeric( new Number( 1 ) );
//=> true
isNumeric( 2 );
//=> true
isNumeric( '2' );
//=> true
isNumeric( NaN );
//=> false
isNumeric( Infinity );
//=> false
```

##### See

[isNumber](../functions/isNumber.md)

#### isString

> **isString**: (`value`) => `value is string`

Determines whether a given object is a string.

##### Parameters

###### value

`unknown`

The value to be tested.

##### Returns

`value is string`

Whether or not `value` is a string.

##### Example

```ts
isString( new String( 'hello' ) );
//=> true
isString( 'hello' );
//=> true
isString( {} );
//=> false
```

#### isValidDate

> **isValidDate**: (`value`) => `value is Date`

Determines whether a given value is a valid date.

##### Parameters

###### value

`unknown`

The date to validate

##### Returns

`value is Date`

the date is valid

##### Examples

```ts
// For the valid date:
var result = isValidDate( new Date( 2014, 1, 31 ) )
//=> true
```

```ts
// For the value, convertable into a date:
var result = isValidDate( 1393804800000 )
//=> true
```

```ts
// For the invalid date:
var result = isValidDate( new Date( '' ) )
//=> false
```

##### See

[http://es5.github.io/#x15.9.1.1](http://es5.github.io/#x15.9.1.1)

#### likeArray

> **likeArray**: (`value`) => `value is ArrayLike<unknown>`

Determines whether a given object is an array-like.

##### Parameters

###### value

`unknown`

The value to be tested.

##### Returns

`value is ArrayLike<unknown>`

Whether or not  is an array-like.

##### Example

```ts
likeArray( [] );
//=> true
likeArray( '' );
//=> true
likeArray( { 0: 'zero', 9: 'nine', length: 10 } );
//=> true
likeArray( { length: 0 } );
//=> true
likeArray( { length: 10 } );
//=> false
likeArray( {} );
//=> false
```

#### propIs

> **propIs**: (`ctor`, `name`, `obj`) => `boolean`

Returns `true` if the specified object property is an instance of the
supplied constructor; `false` otherwise.

##### Parameters

###### ctor

`Function`

The constructor to check against

###### name

`string`

The name of the property to check

###### obj

`unknown`

The object to query

##### Returns

`boolean`

##### Example

```ts
propIs( Number, 'x', { x: 1, y: 2 } ); //=> true
propIs( Number, 'x', { x: 'foo' } ); //=> false
propIs( Number, 'x', {} ); //=> false
```

#### type

> **type**: (`val`) => `string`

Gives a single-word string description of the (native) type of a value,
returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
attempt to distinguish user Object types any further, reporting them all as
'Object'.

##### Parameters

###### val

`unknown`

The value to test

##### Returns

`string`

##### Example

```ts
type( {} ); //=> "Object"
type( 1 ); //=> "Number"
type( false ); //=> "Boolean"
type( 's' ); //=> "String"
type( null ); //=> "Null"
type( [] ); //=> "Array"
type( /[A-z]/ ); //=> "RegExp"
type( () => {} ); //=> "Function"
type( undefined ); //=> "Undefined"
```
