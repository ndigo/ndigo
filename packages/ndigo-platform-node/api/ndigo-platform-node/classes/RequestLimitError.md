[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / RequestLimitError

# Class: RequestLimitError

Transport-level request failure with a deterministic status mapping
(`413` oversized body, `408` timeout, `400` malformed input, …). Thrown by
the request pipeline so the adapter can map it to a problem document
without ever leaking internals to the client.

## Extends

- `Error`

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

`Error.constructor`

## Properties

### code

> `readonly` **code**: `string`

***

### statusCode

> `readonly` **statusCode**: `number`
