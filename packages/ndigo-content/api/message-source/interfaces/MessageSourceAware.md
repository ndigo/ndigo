[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [message-source](../README.md) / MessageSourceAware

# Interface: MessageSourceAware

Marks an object that can receive a message source.

## Extends

- `Aware`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`Aware.[$aware]`

## Methods

### setMessageSource()

> **setMessageSource**(`messageSource`): `void`

Sets the message source used by the receiver.

#### Parameters

##### messageSource

[`MessageSource`](MessageSource.md)

The message source to attach.

#### Returns

`void`
