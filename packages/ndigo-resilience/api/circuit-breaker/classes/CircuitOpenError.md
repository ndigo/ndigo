[**@ndigo/resilience v0.0.1**](../../README.md)

***

[@ndigo/resilience](../../README.md) / [circuit-breaker](../README.md) / CircuitOpenError

# Class: CircuitOpenError

Thrown while a circuit is open: the call was not executed.

## Extends

- `ApplicationError`

## Constructors

### Constructor

> **new CircuitOpenError**(`method`, `entryName`, `remainingMs`): `CircuitOpenError`

#### Parameters

##### method

`PropertyKey`

##### entryName

`string`

##### remainingMs

`number`

#### Returns

`CircuitOpenError`

#### Overrides

`ApplicationError.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Inherited from

`ApplicationError.[toStringTag]`

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Returns a JSON-safe representation of the value.

#### Returns

`JSONValue`

#### Inherited from

`ApplicationError.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Inherited from

`ApplicationError.toString`
