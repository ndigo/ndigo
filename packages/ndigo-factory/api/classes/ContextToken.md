[**@ndigo/factory v0.0.1**](../README.md)

***

[@ndigo/factory](../README.md) / ContextToken

# Class: ContextToken\<_T\>

A type-safe key used for value registration and retrieval in a `Registry`.

At runtime, `description` is used as the backing string key.
The generic parameter `T` provides compile-time type association.

## Type Parameters

### _T

`_T`

The type of the value associated with this token.

## Constructors

### Constructor

> **new ContextToken**\<`_T`\>(`description`, `options?`): `ContextToken`\<`_T`\>

Creates a new ContextToken.

#### Parameters

##### description

`string`

A descriptive string for the token.

##### options?

Optional configuration including `requiredVersion`.

###### requiredVersion?

`string`

#### Returns

`ContextToken`\<`_T`\>

## Properties

### description

> `readonly` **description**: `string`

A descriptive string for the token, used as the backing key at runtime.

***

### requiredVersion?

> `readonly` `optional` **requiredVersion?**: `string`

Optional semver range for the registered value, e.g. `'^1.0.0'`.
When set, the factory checks the resolved entry's version against this range
and warns on mismatch.

## Methods

### toString()

> **toString**(): `string`

Returns a string representation of the ContextToken.

#### Returns

`string`

A string in the format `ContextToken(description)`.
