[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / PropertyValue

# Class: PropertyValue

Defined in: [packages/blue-core/src/property-value.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/property-value.ts#lines-44)

A named value wrapper used for property bags and metadata.

## Implements

- [`Equatable`](../interfaces/Equatable.md)
- [`Serializable`](../interfaces/Serializable.md)

## Constructors

### Constructor

> **new PropertyValue**(`name`, `value`): `PropertyValue`

Defined in: [packages/blue-core/src/property-value.ts:74](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/property-value.ts#lines-74)

Creates a new property value.

#### Parameters

##### name

`string`

Property name.

##### value

`any`

Stored value.

#### Returns

`PropertyValue`

## Properties

### optional

> **optional**: `boolean`

Defined in: [packages/blue-core/src/property-value.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/property-value.ts#lines-49)

Whether the property is optional when consumed by higher-level APIs.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-core/src/property-value.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/property-value.ts#lines-54)

The stable string tag for this instance.

##### Returns

`string`

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/blue-core/src/property-value.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/property-value.ts#lines-59)

The property name.

##### Returns

`string`

***

### value

#### Get Signature

> **get** **value**(): `any`

Defined in: [packages/blue-core/src/property-value.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/property-value.ts#lines-64)

The stored property value.

##### Returns

`any`

## Methods

### equals()

> **equals**(`value`): `boolean`

Defined in: [packages/blue-core/src/property-value.ts:86](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/property-value.ts#lines-86)

Compares this property value to another value.

#### Parameters

##### value

`any`

Value to compare.

#### Returns

`boolean`

`true` when both the name and wrapped value match.

#### Implementation of

[`Equatable`](../interfaces/Equatable.md).[`equals`](../interfaces/Equatable.md#equals)

***

### toJSON()

> **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: [packages/blue-core/src/property-value.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/property-value.ts#lines-101)

Serializes the property value to JSON.

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

A JSON object with `name` and `value` properties.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-core/src/property-value.ts:113](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/property-value.ts#lines-113)

Returns the property name.

#### Returns

`string`

The property name.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)
