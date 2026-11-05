[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-types](../README.md) / HTTPAware

# Interface: HTTPAware

Describes objects that can receive an [HTTP](../../http-client/classes/HTTP.md) instance.

## Extends

- `Aware`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`Aware.[$aware]`

## Methods

### setHTTP()

> **setHTTP**(`http`): `void`

Injects the HTTP client used by the receiver.

#### Parameters

##### http

[`HTTP`](../../http-client/classes/HTTP.md)

The HTTP client to store.

#### Returns

`void`
