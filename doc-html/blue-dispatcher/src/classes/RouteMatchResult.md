[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteMatchResult

# Class: RouteMatchResult

Defined in: [packages/blue-dispatcher/src/route-match-result.ts:6](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-match-result.ts#lines-6)

Result of matching a route pattern to a path.

## Constructors

### Constructor

> **new RouteMatchResult**(`pattern`, `path`): `RouteMatchResult`

Defined in: [packages/blue-dispatcher/src/route-match-result.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-match-result.ts#lines-27)

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

Defined in: [packages/blue-dispatcher/src/route-match-result.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-match-result.ts#lines-10)

The matched pattern.

***

### path

> `readonly` **path**: `string`

Defined in: [packages/blue-dispatcher/src/route-match-result.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-match-result.ts#lines-15)

The matched path.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/route-match-result.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-match-result.ts#lines-17)

##### Returns

`string`

## Methods

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: [packages/blue-dispatcher/src/route-match-result.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-match-result.ts#lines-37)

Serialize the match result to JSON.

#### Returns

`JSONValue`

A JSON representation of the match.
