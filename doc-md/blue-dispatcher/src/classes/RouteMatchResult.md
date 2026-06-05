[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteMatchResult

# Class: RouteMatchResult

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1163

Result of matching a route pattern to a path.

## Constructors

### Constructor

> **new RouteMatchResult**(`pattern`, `path`): `RouteMatchResult`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1184

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

### pattern

> `readonly` **pattern**: `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1167

The matched pattern.

***

### path

> `readonly` **path**: `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1172

The matched path.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1174

##### Returns

`string`

## Methods

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1208

Serialize the match result to JSON.

#### Returns

`JSONValue`

A JSON representation of the match.
