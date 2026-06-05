[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ContextToken

# Class: ContextToken\<_T\>

Defined in: packages/blue-factory/lib/context-token.d.ts:17

A type-safe key used for value registration and retrieval in a Registry.

At runtime, ContextToken.description\|description is used as the backing string key.
The generic parameter `T` provides compile-time type association.

## Type Parameters

### _T

`_T`

The type of the value associated with this token.

## Constructors

### Constructor

> **new ContextToken**\<`_T`\>(`description`): `ContextToken`\<`_T`\>

Defined in: packages/blue-factory/lib/context-token.d.ts:26

Creates a new ContextToken.

#### Parameters

##### description

`string`

A descriptive string for the token.

#### Returns

`ContextToken`\<`_T`\>

## Properties

### description

> `readonly` **description**: `string`

Defined in: packages/blue-factory/lib/context-token.d.ts:21

A descriptive string for the token, used as the backing key at runtime.

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-factory/lib/context-token.d.ts:31

Returns a string representation of the ContextToken.

#### Returns

`string`

A string in the format `ContextToken(description)`.
