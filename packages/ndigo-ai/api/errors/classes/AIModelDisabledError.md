[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [errors](../README.md) / AIModelDisabledError

# Class: AIModelDisabledError

The model rollout flag evaluated to `false`, so the agent refused the call.

## Extends

- `ApplicationError`

## Constructors

### Constructor

> **new AIModelDisabledError**(`flag`): `AIModelDisabledError`

#### Parameters

##### flag

`string`

The feature-flag key that disabled the model.

#### Returns

`AIModelDisabledError`

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
