[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / ContextToken

# Class: ContextToken\<_T\>

Defined in: packages/blue-factory/src/context-token.ts:18

A type-safe key used for value registration and retrieval in a [Registry](../interfaces/Registry.md).

At runtime, ContextToken.description\|description is used as the backing string key.
The generic parameter `T` provides compile-time type association.

## Type Parameters

### _T

`_T`

The type of the value associated with this token.

## Constructors

### Constructor

> **new ContextToken**\<`_T`\>(`description`): `ContextToken`\<`_T`\>

Defined in: packages/blue-factory/src/context-token.ts:28

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

Defined in: packages/blue-factory/src/context-token.ts:22

A descriptive string for the token, used as the backing key at runtime.

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-factory/src/context-token.ts:36

Returns a string representation of the ContextToken.

#### Returns

`string`

A string in the format `ContextToken(description)`.
