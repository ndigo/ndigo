[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / NoHandlerFoundError

# Class: NoHandlerFoundError

Defined in: packages/blue-dispatcher/src/error.ts:14

## Extends

- [`FrameworkError`](../../../blue-core/src/classes/FrameworkError.md)

## Constructors

### Constructor

> **new NoHandlerFoundError**(`route`): `NoHandlerFoundError`

Defined in: packages/blue-dispatcher/src/error.ts:21

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`NoHandlerFoundError`

#### Overrides

[`FrameworkError`](../../../blue-core/src/classes/FrameworkError.md).[`constructor`](../../../blue-core/src/classes/FrameworkError.md#constructor)

## Properties

### route

> **route**: [`Route`](../../../blue-router/src/interfaces/Route.md)

Defined in: packages/blue-dispatcher/src/error.ts:15

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:17

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
