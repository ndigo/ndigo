[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / FrameworkError

# Class: FrameworkError

Defined in: packages/blue-core/src/error.ts:38

## Extends

- [`Serializable`](../interfaces/Serializable.md) & `Error`

## Extended by

- [`IllegalStateError`](IllegalStateError.md)
- [`NoHandlerFoundError`](../../../blue-dispatcher/src/classes/NoHandlerFoundError.md)
- [`NoViewFoundError`](../../../blue-dispatcher/src/classes/NoViewFoundError.md)
- [`RouteBindingError`](../../../blue-dispatcher/src/classes/RouteBindingError.md)

## Constructors

### Constructor

> **new FrameworkError**(`message?`): `FrameworkError`

Defined in: packages/blue-core/src/error.ts:43

#### Parameters

##### message?

`string`

#### Returns

`FrameworkError`

#### Overrides

`AsSerializableError(Error).constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/error.ts:39

##### Returns

`string`

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/serializable.ts:29

#### Returns

`string`

#### Inherited from

`AsSerializableError(Error).toString`

***

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/serializable.ts:30

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Inherited from

`AsSerializableError(Error).toJSON`
