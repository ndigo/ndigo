[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ConfigurablePropertyResolver

# Interface: ConfigurablePropertyResolver

Property resolver that exposes mutable property sources.

## Extends

- [`PropertyResolver`](PropertyResolver.md)

## Properties

### propertySources

> **propertySources**: `JSONObject`[]

The ordered set of property sources used during resolution.

## Methods

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue` \| `undefined`

Resolves a property value, falling back to a default when missing.

#### Parameters

##### key

`string`

The property name to resolve.

##### defaultValue?

`JSONValue`

The value to return when no property is found.

#### Returns

`JSONValue` \| `undefined`

The resolved property value or the default value.

#### Inherited from

[`PropertyResolver`](PropertyResolver.md).[`getProperty`](PropertyResolver.md#getproperty)

***

### getPropertyAs()

> **getPropertyAs**\<`T`\>(`key`, `targetType`, `defaultValue?`): `T` \| `undefined`

Resolves a property as a typed value, converting when needed.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The property name to resolve.

##### targetType

`T` \| ((...`args`) => `T`) \| (() => `T`)

The target constructor or primitive (`Number`, `Boolean`, `Date`, ...).

##### defaultValue?

`T`

The value to return when the property is missing.

#### Returns

`T` \| `undefined`

The typed value or the default.

#### Throws

When a present value cannot be converted.

#### Inherited from

[`PropertyResolver`](PropertyResolver.md).[`getPropertyAs`](PropertyResolver.md#getpropertyas)

***

### getRawProperty()

> **getRawProperty**(`key`): `JSONValue` \| `undefined`

Raw index lookup, bypassing placeholder resolution (internal use by the
placeholder resolver; consumers should use [getProperty](PropertyResolver.md#getproperty)).

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue` \| `undefined`

The raw value or `undefined`.

#### Inherited from

[`PropertyResolver`](PropertyResolver.md).[`getRawProperty`](PropertyResolver.md#getrawproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Returns the resolved property value or throws when missing.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue`

The resolved property value.

#### Throws

When the property cannot be resolved.

#### Inherited from

[`PropertyResolver`](PropertyResolver.md).[`getRequiredProperty`](PropertyResolver.md#getrequiredproperty)

***

### getRequiredPropertyAs()

> **getRequiredPropertyAs**\<`T`\>(`key`, `targetType`): `T`

Returns a typed property or throws when missing or unconvertible.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The property name to resolve.

##### targetType

`T` \| ((...`args`) => `T`) \| (() => `T`)

The target constructor or primitive.

#### Returns

`T`

The typed value.

#### Throws

When missing, unresolved, or unconvertible.

#### Inherited from

[`PropertyResolver`](PropertyResolver.md).[`getRequiredPropertyAs`](PropertyResolver.md#getrequiredpropertyas)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Returns whether a property key can be resolved.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`boolean`

`true` when the property exists.

#### Inherited from

[`PropertyResolver`](PropertyResolver.md).[`hasProperty`](PropertyResolver.md#hasproperty)

***

### originOf()

> **originOf**(`key`): `string` \| `null`

Returns the name of the source that won the given key, or `null` when
the active index does not retain origins or the key is unknown.

#### Parameters

##### key

`string`

The property key (top-level granularity).

#### Returns

`string` \| `null`

The winning source name, or `null`.

#### See

PropertyIndex#originOf

#### Inherited from

[`PropertyResolver`](PropertyResolver.md).[`originOf`](PropertyResolver.md#originof)
