[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-3.md) / isValidDate

# Function: isValidDate()

> **isValidDate**(`value`): `value is Date`

Determines whether a given value is a valid date.

## Parameters

### value

`unknown`

The date to validate

## Returns

`value is Date`

the date is valid

## Examples

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

## See

[http://es5.github.io/#x15.9.1.1](http://es5.github.io/#x15.9.1.1)
