[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouteSegment

# Interface: RouteSegment

Defined in: [packages/blue-router/src/route.ts:8](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route.ts#lines-8)

Represents a single segment within a route, including its name, associated data, and raw string value.

## Since

1.0.0

## Extends

- `Serializable`

## Properties

### name

> **name**: `string`

Defined in: [packages/blue-router/src/route.ts:9](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route.ts#lines-9)

***

### data

> **data**: `JSONObject`

Defined in: [packages/blue-router/src/route.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route.ts#lines-10)

***

### dataString?

> `optional` **dataString?**: `string`

Defined in: [packages/blue-router/src/route.ts:11](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route.ts#lines-11)

***

### raw

> **raw**: `string`

Defined in: [packages/blue-router/src/route.ts:12](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route.ts#lines-12)

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

`Serializable.toString`

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

`Serializable.toJSON`
