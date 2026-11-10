[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [errors](../README.md) / AiRateLimitError

# Class: AiRateLimitError

The rate limiter refused the model call. The caller may retry after
[AiRateLimitError.retryAfterMs](#retryafterms).

## Extends

- `ApplicationError`

## Constructors

### Constructor

> **new AiRateLimitError**(`key`, `retryAfterMs`): `AiRateLimitError`

#### Parameters

##### key

`string`

The rate-limit key that was exhausted.

##### retryAfterMs

`number`

Milliseconds until the window resets.

#### Returns

`AiRateLimitError`

#### Overrides

`ApplicationError.constructor`

## Properties

### retryAfterMs

> `readonly` **retryAfterMs**: `number`

Milliseconds until the current rate-limit window resets.

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
