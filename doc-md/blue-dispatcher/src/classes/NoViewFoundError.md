[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / NoViewFoundError

# Class: NoViewFoundError

Defined in: packages/blue-dispatcher/src/error.ts:35

## Extends

- [`FrameworkError`](../../../blue-core/src/classes/FrameworkError.md)

## Constructors

### Constructor

> **new NoViewFoundError**(`viewName`, `route`): `NoViewFoundError`

Defined in: packages/blue-dispatcher/src/error.ts:43

#### Parameters

##### viewName

`string`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`NoViewFoundError`

#### Overrides

[`FrameworkError`](../../../blue-core/src/classes/FrameworkError.md).[`constructor`](../../../blue-core/src/classes/FrameworkError.md#constructor)

## Properties

### route

> `readonly` **route**: [`Route`](../../../blue-router/src/interfaces/Route.md)

Defined in: packages/blue-dispatcher/src/error.ts:36

***

### viewName

> `readonly` **viewName**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:37

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:39

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
