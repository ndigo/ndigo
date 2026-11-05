[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [property-source](../README.md) / MapPropertySource

# Class: MapPropertySource

Default [PropertySource](../interfaces/PropertySource.md) implementation wrapping a captured object.

## Implements

- [`PropertySource`](../interfaces/PropertySource.md)

## Constructors

### Constructor

> **new MapPropertySource**(`name`, `properties`): `MapPropertySource`

Creates a property source over the given object.

#### Parameters

##### name

`string`

The stable source name.

##### properties

`JSONObject`

The property values backing this source.

#### Returns

`MapPropertySource`

## Accessors

### name

#### Get Signature

> **get** **name**(): `string`

The stable name of this source.

##### Returns

`string`

The stable name of this source, used as an anchor for reordering.

#### Implementation of

[`PropertySource`](../interfaces/PropertySource.md).[`name`](../interfaces/PropertySource.md#name)

***

### properties

#### Get Signature

> **get** **properties**(): `JSONObject`

The captured property values of this source.

##### Returns

`JSONObject`

The captured property values of this source.

#### Implementation of

[`PropertySource`](../interfaces/PropertySource.md).[`properties`](../interfaces/PropertySource.md#properties)

## Methods

### containsProperty()

> **containsProperty**(`key`): `boolean`

Returns whether a property resolves to a non-null value from this source.

#### Parameters

##### key

`string`

The property name to check (keypath syntax).

#### Returns

`boolean`

`true` when the property is defined.

#### Implementation of

[`PropertySource`](../interfaces/PropertySource.md).[`containsProperty`](../interfaces/PropertySource.md#containsproperty)

***

### getProperty()

> **getProperty**(`key`): `JSONValue` \| `undefined`

Resolves a property from this source, or `undefined` when absent.

#### Parameters

##### key

`string`

The property name to resolve (keypath syntax).

#### Returns

`JSONValue` \| `undefined`

The resolved value, or `undefined`.

#### Implementation of

[`PropertySource`](../interfaces/PropertySource.md).[`getProperty`](../interfaces/PropertySource.md#getproperty)
