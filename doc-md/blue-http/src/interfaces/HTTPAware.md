[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTPAware

# Interface: HTTPAware

Defined in: [packages/blue-http/src/http.ts:160](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-160)

Describes objects that can receive an [HTTP](../classes/HTTP.md) instance.

## Extends

- `Aware`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`Aware.[$aware]`

## Methods

### setHTTP()

> **setHTTP**(`http`): `void`

Defined in: [packages/blue-http/src/http.ts:166](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-166)

Injects the HTTP client used by the receiver.

#### Parameters

##### http

[`HTTP`](../classes/HTTP.md)

The HTTP client to store.

#### Returns

`void`
