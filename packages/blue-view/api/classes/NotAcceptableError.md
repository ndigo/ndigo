[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / NotAcceptableError

# Class: NotAcceptableError

Raised when a view name resolves to candidate representations but none
satisfies the request's accepted media types (HTTP 406 — the route/handler
exists, only the representation is unavailable). Distinct from a missing
view, which stays `NoViewFoundError`/404.

## Extends

- [`FrameworkError`](#)

## Constructors

### Constructor

> **new NotAcceptableError**(`viewName`, `acceptedMediaTypes`): `NotAcceptableError`

Creates a not-acceptable signal for the resolved view name.

#### Parameters

##### viewName

`string`

The view name whose representations were refused.

##### acceptedMediaTypes

`MediaType`[]

The request's accepted media types.

#### Returns

`NotAcceptableError`

#### Overrides

`FrameworkError.constructor`

## Properties

### acceptedMediaTypes

> `readonly` **acceptedMediaTypes**: `MediaType`[]

The accepted media types considered, in client-priority order.

***

### viewName

> `readonly` **viewName**: `string`

The view name whose candidates were unacceptable.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Inherited from

`FrameworkError.[toStringTag]`

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`
