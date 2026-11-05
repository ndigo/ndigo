[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [stomp-frame](../README.md) / StompProtocolError

# Class: StompProtocolError

Raised on malformed frames (missing NUL, bad `content-length`, …).

## Extends

- `Error`

## Constructors

### Constructor

> **new StompProtocolError**(`message`): `StompProtocolError`

#### Parameters

##### message

`string`

Human-readable protocol failure detail.

#### Returns

`StompProtocolError`

#### Overrides

`Error.constructor`
