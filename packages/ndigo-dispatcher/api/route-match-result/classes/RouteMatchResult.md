[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-match-result](../README.md) / RouteMatchResult

# Class: RouteMatchResult

Result of matching a route pattern to a path.

## Constructors

### Constructor

> **new RouteMatchResult**(`pattern`, `path`): `RouteMatchResult`

Create a route match result.

#### Parameters

##### pattern

`string`

The matched pattern.

##### path

`string`

The matched path.

#### Returns

`RouteMatchResult`

## Properties

### path

> `readonly` **path**: `string`

The matched path.

***

### pattern

> `readonly` **pattern**: `string`

The matched pattern.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the match result to JSON.

#### Returns

`JSONValue`

A JSON representation of the match.
