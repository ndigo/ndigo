[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteBindingError

# Class: RouteBindingError

Defined in: packages/blue-dispatcher/src/error.ts:57

An error that represents a failure to retrieve a required Route\|Route property.

## Extends

- `FrameworkError`

## Constructors

### Constructor

> **new RouteBindingError**(`message`): `RouteBindingError`

Defined in: packages/blue-dispatcher/src/error.ts:65

#### Parameters

##### message

`string`

#### Returns

`RouteBindingError`

#### Overrides

`FrameworkError.constructor`

### Constructor

> **new RouteBindingError**(`route`, `name`): `RouteBindingError`

Defined in: packages/blue-dispatcher/src/error.ts:66

#### Parameters

##### route

`Route`

##### name

`string`

#### Returns

`RouteBindingError`

#### Overrides

`FrameworkError.constructor`

## Properties

### route

> **route**: `Route`\<`Record`\<`string`, `string`\>\> \| `null`

Defined in: packages/blue-dispatcher/src/error.ts:58

***

### name

> **name**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:59

#### Overrides

`FrameworkError.name`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:61

##### Returns

`string`

#### Overrides

`FrameworkError.[toStringTag]`

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`
