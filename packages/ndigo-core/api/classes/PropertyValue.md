[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / PropertyValue

# Class: PropertyValue

A named value wrapper used for property bags and metadata.

## Implements

- [`Equatable`](../interfaces/Equatable.md)
- [`Serializable`](../interfaces/Serializable.md)

## Constructors

### Constructor

> **new PropertyValue**(`name`, `value`): `PropertyValue`

Creates a new property value.

#### Parameters

##### name

`string`

Property name.

##### value

`unknown`

Stored value.

#### Returns

`PropertyValue`

## Properties

### optional

> **optional**: `boolean`

Whether the property is optional when consumed by higher-level APIs.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The stable string tag for this instance.

##### Returns

`string`

***

### name

#### Get Signature

> **get** **name**(): `string`

The property name.

##### Returns

`string`

***

### value

#### Get Signature

> **get** **value**(): `unknown`

The stored property value.

##### Returns

`unknown`

## Methods

### equals()

> **equals**(`value`): `boolean`

Compares this property value to another value.

#### Parameters

##### value

`unknown`

Value to compare.

#### Returns

`boolean`

`true` when both the name and wrapped value match.

#### Implementation of

[`Equatable`](../interfaces/Equatable.md).[`equals`](../interfaces/Equatable.md#equals)

***

### toJSON()

> **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Serializes the property value to JSON.

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

A JSON object with `name` and `value` properties.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Returns the property name.

#### Returns

`string`

The property name.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)
