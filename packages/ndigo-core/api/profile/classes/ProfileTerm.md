[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [profile](../README.md) / ProfileTerm

# Class: ProfileTerm

A composed profile expression. Immutable; `String(term)` yields the
canonical expression string, so terms drop into `@whenProfile(...)` and
`acceptsProfiles(...)` seamlessly.

## Implements

- [`Serializable`](../../serializable/interfaces/Serializable.md)
- [`Equatable`](../../equatable/interfaces/Equatable.md)\<`ProfileTerm`\>

## Constructors

### Constructor

> **new ProfileTerm**(`source`, `kind`): `ProfileTerm`

#### Parameters

##### source

`string`

##### kind

[`TermKind`](../type-aliases/TermKind.md)

#### Returns

`ProfileTerm`

## Accessors

### kind

#### Get Signature

> **get** **kind**(): [`TermKind`](../type-aliases/TermKind.md)

The kind of term (`name`, `not`, `and`, `or`, `compound`).

##### Returns

[`TermKind`](../type-aliases/TermKind.md)

## Methods

### equals()

> **equals**(`value`): `boolean`

Compares this term with another by canonical source.

#### Parameters

##### value

`unknown`

The value to compare.

#### Returns

`boolean`

`true` when both terms have the same canonical source.

#### Implementation of

[`Equatable`](../../equatable/interfaces/Equatable.md).[`equals`](../../equatable/interfaces/Equatable.md#equals)

***

### toString()

> **toString**(): `string`

The canonical expression string, e.g. `'dev & !ci'`.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)
