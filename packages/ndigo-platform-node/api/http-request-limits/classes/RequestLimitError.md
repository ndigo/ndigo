[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [http-request-limits](../README.md) / RequestLimitError

# Class: RequestLimitError

Transport-level request failure with a deterministic status mapping
(`413` oversized body, `408` timeout, `400` malformed input, …). Thrown by
the request pipeline so the adapter can map it to a problem document
without ever leaking internals to the client.

## Extends

- [`FrameworkError`](#)

## Constructors

### Constructor

> **new RequestLimitError**(`statusCode`, `code`, `message`): `RequestLimitError`

#### Parameters

##### statusCode

`number`

##### code

`string`

##### message

`string`

#### Returns

`RequestLimitError`

#### Overrides

`FrameworkError.constructor`

## Properties

### code

> `readonly` **code**: `string`

***

### statusCode

> `readonly` **statusCode**: `number`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Inherited from

`FrameworkError.[toStringTag]`

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`
