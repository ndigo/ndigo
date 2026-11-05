[**@ndigo/resilience v0.0.1**](../../README.md)

***

[@ndigo/resilience](../../README.md) / [circuit-breaker](../README.md) / CircuitOpenError

# Class: CircuitOpenError

Thrown while a circuit is open: the call was not executed.

## Extends

- `Error`

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

`Error.constructor`
