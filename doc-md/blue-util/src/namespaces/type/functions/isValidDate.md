[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [type](../README.md) / isValidDate

# Function: isValidDate()

> **isValidDate**(`value`): `value is Date`

Defined in: packages/blue-util/src/type/is-valid-date.ts:34

Determines whether a given value is a valid date.

## Parameters

### value

`any`

## Returns

`value is Date`

the date is valid

## Description

Returns false if argument is and invalid date and true otherwise.
Invalid Date is a Date, whose time value is NaN.

## Throws

1 argument required

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
