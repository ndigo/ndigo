[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteBindingError

# Class: RouteBindingError

Defined in: packages/blue-dispatcher/src/error.ts:64

An error that represents a failure to retrieve a required [Route](../../../blue-router/src/interfaces/Route.md) property.

## Extends

- [`FrameworkError`](../../../blue-core/src/classes/FrameworkError.md)

## Constructors

### Constructor

> **new RouteBindingError**(`message`): `RouteBindingError`

Defined in: packages/blue-dispatcher/src/error.ts:72

#### Parameters

##### message

`string`

#### Returns

`RouteBindingError`

#### Overrides

[`FrameworkError`](../../../blue-core/src/classes/FrameworkError.md).[`constructor`](../../../blue-core/src/classes/FrameworkError.md#constructor)

### Constructor

> **new RouteBindingError**(`route`, `name`): `RouteBindingError`

Defined in: packages/blue-dispatcher/src/error.ts:73

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### name

`string`

#### Returns

`RouteBindingError`

#### Overrides

`FrameworkError.constructor`

## Properties

### route

> **route**: [`Route`](../../../blue-router/src/interfaces/Route.md)

Defined in: packages/blue-dispatcher/src/error.ts:65

***

### name

> **name**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:66

#### Overrides

`FrameworkError.name`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:68

##### Returns

`string`

#### Overrides

[`FrameworkError`](../../../blue-core/src/classes/FrameworkError.md).[`[toStringTag]`](../../../blue-core/src/classes/FrameworkError.md#tostringtag)

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/serializable.ts:29

#### Returns

`string`

#### Inherited from

[`FrameworkError`](../../../blue-core/src/classes/FrameworkError.md).[`toString`](../../../blue-core/src/classes/FrameworkError.md#tostring)

***

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/serializable.ts:30

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

[`FrameworkError`](../../../blue-core/src/classes/FrameworkError.md).[`toJSON`](../../../blue-core/src/classes/FrameworkError.md#tojson)
