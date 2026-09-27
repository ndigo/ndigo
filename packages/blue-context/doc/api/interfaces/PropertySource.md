[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / PropertySource

# Interface: PropertySource

A named, ordered property source backed by a plain object.

Instances are created through [wrapSource](../functions/wrapSource.md), which captures the given
object into a null-prototype copy — registering a source never exposes the
live caller object, and remains safe even if the caller mutates it later.
Property values are resolved by keypath (`a.b.c`, `items[0].name`).

## See

 - module:context.PropertySources
 - module:context.ConfigurableEnvironment

## Properties

### name

> `readonly` **name**: `string`

The stable name of this source, used as an anchor for reordering.

***

### properties

> `readonly` **properties**: `JSONObject`

The captured property values of this source.

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
